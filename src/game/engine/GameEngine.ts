/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../constants';
import {
  MapId,
  CharacterId,
  InputState,
  Rect,
  Platform,
  Hazard,
  Collectible,
  Checkpoint,
  ExitPortal,
} from '../types';
import { soundManager } from '../audio/SoundManager';
import { Player } from './Player';
import { Camera } from './Camera';
import { EnemyManager } from './Enemies';
import { ParticleSystem } from './ParticleSystem';
import { loadLevel, LevelData } from './Levels';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, coins: number) => void;
  onCheckpointReached: (checkpointId: string) => void;
  onVictory: (stats: { score: number; coins: number; timeElapsed: number }) => void;
  onGameOver: () => void;
  onBossStateChange?: (boss: { name: string; health: number; maxHealth: number } | null) => void;
}

export class GameEngine {
  public player: Player;
  public camera: Camera;
  public enemyManager: EnemyManager;
  public particles: ParticleSystem;

  public level: LevelData;
  public currentMapId: MapId = 'shadow_forest';
  public lastCheckpoint: { x: number; y: number } | null = null;

  public isPaused: boolean = false;
  public isCompleted: boolean = false;
  public isDead: boolean = false;

  public score: number = 0;
  public coinsCollectedInRun: number = 0;
  public timeElapsed: number = 0;
  public screenShakeEnabled: boolean = true;

  public callbacks: GameEngineCallbacks;

  // Ambient particle emission timer
  private ambientTimer: number = 0;

  constructor(
    charId: CharacterId = 'kairo',
    mapId: MapId = 'shadow_forest',
    callbacks: GameEngineCallbacks
  ) {
    this.callbacks = callbacks;
    this.currentMapId = mapId;
    this.player = new Player(charId);
    this.camera = new Camera();
    this.enemyManager = new EnemyManager();
    this.particles = new ParticleSystem();

    this.level = loadLevel(mapId);
    this.initLevel();
  }

  public setCharacter(charId: CharacterId) {
    this.player.characterId = charId;
    this.player.applyCharacterPerks();
  }

  public setMap(mapId: MapId) {
    this.currentMapId = mapId;
    this.level = loadLevel(mapId);
    this.initLevel();
  }

  public initLevel() {
    this.player.respawn(this.level.spawnX, this.level.spawnY);
    this.enemyManager.enemies = JSON.parse(JSON.stringify(this.level.enemies));
    this.enemyManager.projectiles = [];
    this.particles.particles = [];

    this.lastCheckpoint = { x: this.level.spawnX, y: this.level.spawnY };
    this.camera.minX = 0;
    this.camera.maxX = this.level.worldWidth;
    this.camera.minY = 0;
    this.camera.maxY = this.level.worldHeight;
    this.camera.x = 0;
    this.camera.y = 0;

    this.isPaused = false;
    this.isCompleted = false;
    this.isDead = false;
    this.timeElapsed = 0;

    // Start level BGM
    soundManager.playBGM(this.level.metadata.theme);
  }

  public respawnAtCheckpoint() {
    const spawn = this.lastCheckpoint || { x: this.level.spawnX, y: this.level.spawnY };
    this.player.respawn(spawn.x, spawn.y);
    this.isDead = false;
    this.camera.triggerShake(4, 0.2);
  }

  public update(dt: number, input: InputState) {
    if (this.isPaused || this.isCompleted) return;

    this.timeElapsed += dt;

    // Ambient particles (blossoms, snow, embers)
    this.updateAmbientParticles(dt);

    // Hazard animations (sawblade rotation, moving platforms)
    this.updateWorldHazards(dt);

    // Player update
    const playerUpdate = this.player.update(
      dt,
      {
        left: input.left,
        right: input.right,
        jump: input.jump,
        jumpPressed: input.jumpPressedThisFrame,
        attackPressed: input.attackPressedThisFrame,
        dashPressed: input.dashPressedThisFrame,
        shurikenPressed: input.shurikenPressedThisFrame,
        down: input.down,
      },
      this.level.platforms,
      this.particles
    );

    // Throw shuriken if requested
    if (playerUpdate.throwShuriken) {
      this.enemyManager.projectiles.push({
        id: `p_shuriken_${Date.now()}`,
        x: this.player.x + (this.player.facing === 1 ? this.player.width + 4 : -4),
        y: this.player.y + 24,
        vx: this.player.facing * 720,
        vy: 0,
        radius: 8,
        damage: this.player.stats.attack * 1.1,
        fromPlayer: true,
        lifetime: 1.8,
        type: 'shuriken',
        rotation: 0,
      });
    }

    // Resolve Player Katana attacks hitting enemies
    if (this.player.attackHitbox && !this.player.hasHitCurrentAttack) {
      for (const e of this.enemyManager.enemies) {
        if (e.state === 'DEAD') continue;
        const eRect = { x: e.x, y: e.y, width: e.width, height: e.height };
        if (this.checkOverlap(this.player.attackHitbox, eRect)) {
          this.player.hasHitCurrentAttack = true;
          this.camera.triggerShake(5, 0.15);

          const result = this.enemyManager.damageEnemy(
            e.id,
            this.player.stats.attack * (this.player.attackStep === 3 ? 1.6 : 1),
            this.player.facing,
            this.particles
          );

          if (result.defeated) {
            this.score += result.score;
            this.coinsCollectedInRun += result.coins;
            this.player.stats.coins += result.coins;
            this.player.stats.xp += result.isBoss ? 200 : 25;
            this.callbacks.onScoreUpdate(this.score, this.coinsCollectedInRun);

            // If boss defeated in Silent Cliffs, unlock portal
            if (result.isBoss) {
              this.level.exitPortal.opened = true;
              this.particles.emitShockwave(this.level.exitPortal.x + 30, this.level.exitPortal.y + 60, '#38bdf8');
              soundManager.playCheckpoint();
            }
          }
          break;
        }
      }
    }

    // Update Enemies & Projectiles
    const pRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
    };

    this.enemyManager.update(
      dt,
      pRect,
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.particles,
      (damage, knockbackX) => {
        const dead = this.player.takeDamage(damage, knockbackX, this.particles);
        this.camera.triggerShake(7, 0.25);
        if (dead && !this.isDead) {
          this.isDead = true;
          this.callbacks.onGameOver();
        }
      }
    );

    // Notify Boss state if active
    const boss = this.enemyManager.enemies.find((e) => e.isBoss && e.state !== 'DEAD');
    if (this.callbacks.onBossStateChange) {
      if (boss) {
        this.callbacks.onBossStateChange({
          name: this.level.metadata.bossName || 'Akuma the Shadow Overlord',
          health: boss.health,
          maxHealth: boss.maxHealth,
        });
      } else {
        this.callbacks.onBossStateChange(null);
      }
    }

    // Check Collectibles
    for (const c of this.level.collectibles) {
      if (c.collected) continue;
      c.bobOffset += dt * 3;
      const cDist = Math.hypot(
        this.player.x + this.player.width / 2 - c.x,
        this.player.y + this.player.height / 2 - c.y
      );

      if (cDist < c.radius + this.player.width / 2) {
        c.collected = true;
        this.particles.emitHitSparks(c.x, c.y, '#f59e0b', 8);

        if (c.type === 'coin') {
          soundManager.playCoin();
          this.coinsCollectedInRun += c.value;
          this.player.stats.coins += c.value;
          this.score += 100;
        } else if (c.type === 'energy_orb') {
          soundManager.playCoin();
          this.player.stats.energy = Math.min(
            this.player.stats.maxEnergy,
            this.player.stats.energy + c.value
          );
        } else if (c.type === 'health_flask') {
          soundManager.playCoin();
          this.player.stats.health = Math.min(
            this.player.stats.maxHealth,
            this.player.stats.health + c.value
          );
        } else if (c.type === 'shuriken_bundle') {
          soundManager.playCoin();
          this.player.stats.shurikens = Math.min(
            this.player.stats.maxShurikens,
            this.player.stats.shurikens + c.value
          );
        } else if (c.type === 'scroll') {
          soundManager.playCheckpoint();
          this.score += 500;
        }

        this.callbacks.onScoreUpdate(this.score, this.coinsCollectedInRun);
      }
    }

    // Check Checkpoints (Torii gates)
    for (const cp of this.level.checkpoints) {
      if (!cp.activated) {
        const cpRect = { x: cp.x, y: cp.y, width: cp.width, height: cp.height };
        if (this.checkOverlap(pRect, cpRect)) {
          cp.activated = true;
          this.lastCheckpoint = { x: cp.x + cp.width / 2, y: cp.y + cp.height - this.player.height };
          soundManager.playCheckpoint();
          this.particles.emitShockwave(cp.x + cp.width / 2, cp.y + cp.height / 2, '#38bdf8');
          this.callbacks.onCheckpointReached(cp.id);
        }
      }
    }

    // Check Hazards (Spikes, Lava, Sawblades)
    for (const h of this.level.hazards) {
      if (this.checkOverlap(pRect, h)) {
        const dead = this.player.takeDamage(h.damage, 0, this.particles);
        this.camera.triggerShake(8, 0.3);
        if (dead && !this.isDead) {
          this.isDead = true;
          this.callbacks.onGameOver();
        }
      }
    }

    // Check Fall Death (fell into endless void)
    if (this.player.y > this.level.worldHeight + 100 && !this.isDead) {
      this.player.stats.health = 0;
      this.isDead = true;
      this.callbacks.onGameOver();
    }

    // Check Exit Portal
    const portal = this.level.exitPortal;
    if (portal.opened && !this.isCompleted) {
      const portalRect = { x: portal.x, y: portal.y, width: portal.width, height: portal.height };
      if (this.checkOverlap(pRect, portalRect)) {
        this.isCompleted = true;
        soundManager.playCheckpoint();
        this.particles.emitShockwave(portal.x + 30, portal.y + 60, '#10b981');
        this.callbacks.onVictory({
          score: this.score,
          coins: this.coinsCollectedInRun,
          timeElapsed: Math.round(this.timeElapsed),
        });
      }
    }

    // Update Particles
    this.particles.update(dt);

    // Update Camera
    this.camera.update(
      dt,
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.player.facing,
      this.screenShakeEnabled
    );
  }

  private updateWorldHazards(dt: number) {
    // Sawblades
    for (const h of this.level.hazards) {
      if (h.type === 'sawblade' && h.rotation !== undefined) {
        h.rotation += 12 * dt;
      }
    }

    // Moving platforms
    for (const p of this.level.platforms) {
      if (p.type === 'moving_horizontal' && p.speed && p.dir && p.minX !== undefined && p.maxX !== undefined) {
        p.x += p.speed * p.dir * dt;
        if (p.x <= p.minX) {
          p.x = p.minX;
          p.dir = 1;
        } else if (p.x + p.width >= p.maxX) {
          p.x = p.maxX - p.width;
          p.dir = -1;
        }
      } else if (p.type === 'moving_vertical' && p.speed && p.dir && p.minY !== undefined && p.maxY !== undefined) {
        p.y += p.speed * p.dir * dt;
        if (p.y <= p.minY) {
          p.y = p.minY;
          p.dir = 1;
        } else if (p.y >= p.maxY) {
          p.y = p.maxY;
          p.dir = -1;
        }
      }
    }
  }

  private updateAmbientParticles(dt: number) {
    this.ambientTimer += dt;
    if (this.ambientTimer > 0.08) {
      this.ambientTimer = 0;
      const camLeft = this.camera.x - 100;
      const camRight = this.camera.x + VIRTUAL_WIDTH + 100;
      const camTop = this.camera.y - 100;

      const px = camLeft + Math.random() * (camRight - camLeft);
      const py = camTop + Math.random() * 200;

      const pType = this.level.ambientParticleType;

      this.particles.particles.push({
        x: px,
        y: py,
        vx: pType === 'petal' ? -35 : pType === 'snow' ? -15 : (Math.random() - 0.5) * 20,
        vy: pType === 'ember' ? -40 : 45 + Math.random() * 30,
        size: pType === 'petal' ? 3.5 : pType === 'snow' ? 2 : 2.5,
        color: pType === 'petal' ? '#f43f5e' : pType === 'snow' ? '#e2e8f0' : '#f97316',
        alpha: 0.75,
        life: 5.5,
        maxLife: 5.5,
        type: pType,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 2,
      });
    }
  }

  private checkOverlap(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // --- RENDER PASS ---

  public render(ctx: CanvasRenderingContext2D) {
    // 1. Clear Virtual Screen
    ctx.fillStyle = this.level.skyColor;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 2. Parallax Background Layers
    this.renderParallaxBackground(ctx);

    // 3. World Entities (under Camera transformation)
    ctx.save();
    this.camera.apply(ctx);

    // Render Platforms
    this.renderPlatforms(ctx);

    // Render Hazards
    this.renderHazards(ctx);

    // Render Checkpoints (Torii Gates)
    this.renderCheckpoints(ctx);

    // Render Exit Portal
    this.renderExitPortal(ctx);

    // Render Collectibles
    this.renderCollectibles(ctx);

    // Render Enemies
    this.enemyManager.render(ctx);

    // Render Player
    this.player.render(ctx);

    // Render Particle System
    this.particles.render(ctx);

    ctx.restore();

    // 4. Foreground Atmospheric Vignette & Moonlit Mist
    this.renderForegroundOverlay(ctx);
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D) {
    const camX = this.camera.x;
    const camY = this.camera.y;

    // Distant Celestial Body (Moon / Sun)
    ctx.save();
    const isEclipsed = this.currentMapId === 'silent_cliffs';
    const isLava = this.currentMapId === 'lava_valley';
    const moonColor = isEclipsed ? '#7f1d1d' : isLava ? '#ea580c' : '#f8fafc';
    const moonGlow = isEclipsed ? '#ef4444' : isLava ? '#f97316' : '#38bdf8';

    ctx.fillStyle = moonColor;
    ctx.shadowColor = moonGlow;
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(VIRTUAL_WIDTH * 0.78, 160 - camY * 0.05, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Layer 1: Distant Mountain Silhouettes (Parallax 0.08)
    ctx.fillStyle = this.level.mountainColor;
    ctx.beginPath();
    ctx.moveTo(0, VIRTUAL_HEIGHT);
    const mOffset = -(camX * 0.08) % 600;
    for (let x = -600 + mOffset; x <= VIRTUAL_WIDTH + 600; x += 300) {
      ctx.lineTo(x + 150, 240 + Math.sin(x) * 40 - camY * 0.04);
      ctx.lineTo(x + 300, VIRTUAL_HEIGHT);
    }
    ctx.fill();

    // Layer 2: Midground Japanese Pagodas and Pine Trees (Parallax 0.22)
    ctx.fillStyle = this.level.foliageColor;
    ctx.beginPath();
    ctx.moveTo(0, VIRTUAL_HEIGHT);
    const pOffset = -(camX * 0.22) % 400;
    for (let x = -400 + pOffset; x <= VIRTUAL_WIDTH + 400; x += 200) {
      // Pine tree shape
      ctx.lineTo(x + 50, 420 - camY * 0.1);
      ctx.lineTo(x + 70, 370 - camY * 0.1);
      ctx.lineTo(x + 100, 320 - camY * 0.1);
      ctx.lineTo(x + 130, 370 - camY * 0.1);
      ctx.lineTo(x + 150, 420 - camY * 0.1);
      ctx.lineTo(x + 200, VIRTUAL_HEIGHT);
    }
    ctx.fill();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    for (const p of this.level.platforms) {
      ctx.save();

      if (p.type === 'ice') {
        // Glowing cyan icy platform
        ctx.fillStyle = '#0f2b46';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        // Ice crystal highlight on top
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(p.x, p.y, p.width, 3);
      } else if (p.type === 'one_way') {
        // Wooden Japanese bridge beam
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        // Top decorative trim
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x, p.y, p.width, 3);
      } else if (p.type === 'moving_horizontal' || p.type === 'moving_vertical') {
        // Mystic floating runic platform
        ctx.fillStyle = '#18181b';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
        ctx.shadowBlur = 0;

        // Glowing core crystal
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x + p.width / 2 - 12, p.y + 4, 24, p.height - 8);
      } else {
        // Solid Ground
        ctx.fillStyle = '#090d16';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Top Grass/Stone trim
        ctx.fillStyle = this.currentMapId === 'lava_valley' ? '#7f1d1d' : '#1e293b';
        ctx.fillRect(p.x, p.y, p.width, 6);

        // Subtle dark borders
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      }

      ctx.restore();
    }
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const h of this.level.hazards) {
      ctx.save();

      if (h.type === 'spikes') {
        // Japanese bamboo stakes / iron spikes
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        const spikeW = 14;
        const count = Math.floor(h.width / spikeW);
        for (let i = 0; i < count; i++) {
          ctx.beginPath();
          ctx.moveTo(h.x + i * spikeW, h.y + h.height);
          ctx.lineTo(h.x + i * spikeW + spikeW / 2, h.y);
          ctx.lineTo(h.x + (i + 1) * spikeW, h.y + h.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else if (h.type === 'lava') {
        // Bubbling Molten Magma
        ctx.fillStyle = '#ea580c';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillRect(h.x, h.y, h.width, h.height);

        // Glowing surface wave
        ctx.fillStyle = '#fef08a';
        const wave = Math.sin(Date.now() * 0.005) * 4;
        ctx.fillRect(h.x, h.y + wave, h.width, 5);
        ctx.shadowBlur = 0;
      } else if (h.type === 'sawblade') {
        // Spinning Sawblade
        const cx = h.x + h.width / 2;
        const cy = h.y + h.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(h.rotation || 0);

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, h.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        // Saw teeth
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, -h.width / 2);
          ctx.lineTo(6, -h.width / 2 - 8);
          ctx.lineTo(0, -h.width / 2 - 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D) {
    for (const cp of this.level.checkpoints) {
      ctx.save();
      ctx.translate(cp.x, cp.y);

      // Torii Gate Pillars
      ctx.fillStyle = cp.activated ? '#b91c1c' : '#450a0a';
      ctx.fillRect(2, 0, 8, cp.height);
      ctx.fillRect(cp.width - 10, 0, 8, cp.height);

      // Top Curved Torii Beam
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(cp.width / 2, -4, cp.width + 6, 8);
      ctx.lineWidth = 7;
      ctx.strokeStyle = cp.activated ? '#ef4444' : '#7f1d1d';
      ctx.stroke();

      // Second Crossbeam
      ctx.fillRect(-2, 22, cp.width + 4, 5);

      // Lanterns hanging on both sides
      const lanternGlow = cp.activated ? '#38bdf8' : '#334155';
      ctx.fillStyle = lanternGlow;
      ctx.shadowColor = lanternGlow;
      ctx.shadowBlur = cp.activated ? 16 : 0;

      // Left lantern
      ctx.beginPath();
      ctx.arc(6, 34, 5, 0, Math.PI * 2);
      ctx.fill();

      // Right lantern
      ctx.beginPath();
      ctx.arc(cp.width - 6, 34, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderExitPortal(ctx: CanvasRenderingContext2D) {
    const portal = this.level.exitPortal;
    ctx.save();
    ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);

    const t = Date.now() * 0.003;
    const color = portal.opened ? '#10b981' : '#64748b';

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = portal.opened ? 20 : 0;

    // Swirling portal rings
    ctx.rotate(t);
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.width / 2, portal.height / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-t * 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.width / 3, portal.height / 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing core
    if (portal.opened) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 0, portal.width / 4, portal.height / 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    for (const c of this.level.collectibles) {
      if (c.collected) continue;

      ctx.save();
      const bobY = c.y + Math.sin(c.bobOffset) * 6;
      ctx.translate(c.x, bobY);

      if (c.type === 'coin') {
        // Spinning Golden Shuriken Coin
        const spin = Math.cos(c.bobOffset * 2);
        ctx.scale(spin, 1);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.fillRect(-2, -c.radius + 3, 4, (c.radius - 3) * 2);
      } else if (c.type === 'energy_orb') {
        // Pulsing Blue Soul Orb
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'health_flask') {
        // Jade Health Potion
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(-8, -12, 16, 24, 4);
        ctx.fill();
        // Flask cap
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, -16, 8, 4);
      } else if (c.type === 'shuriken_bundle') {
        // Shuriken Pack
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'scroll') {
        // Ancient Scroll
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fillRect(-12, -8, 24, 16);
      }

      ctx.restore();
    }
  }

  private renderForegroundOverlay(ctx: CanvasRenderingContext2D) {
    // Subtle dark cinematic vignette around the edges
    const grad = ctx.createRadialGradient(
      VIRTUAL_WIDTH / 2,
      VIRTUAL_HEIGHT / 2,
      VIRTUAL_WIDTH * 0.35,
      VIRTUAL_WIDTH / 2,
      VIRTUAL_HEIGHT / 2,
      VIRTUAL_WIDTH * 0.72
    );
    grad.addColorStop(0, 'rgba(5, 7, 13, 0)');
    grad.addColorStop(1, 'rgba(5, 7, 13, 0.55)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }
}
