/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GRAVITY,
  TERMINAL_VELOCITY,
  WALL_SLIDE_SPEED,
  PLAYER_DEFAULTS,
} from '../constants';
import {
  PlayerAnimation,
  PlayerStats,
  ScarfNode,
  Rect,
  Platform,
  CharacterId,
} from '../types';
import { soundManager } from '../audio/SoundManager';
import { ParticleSystem } from './ParticleSystem';

export class Player {
  // Position and Bounding Box
  public x: number = 100;
  public y: number = 300;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 36;
  public height: number = 64;

  public characterId: CharacterId = 'kairo';
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = false;
  public isTouchingWall: boolean = false;
  public wallDirection: 1 | -1 = 1;
  public canDoubleJump: boolean = true;

  // States
  public anim: PlayerAnimation = 'IDLE';
  public animTimer: number = 0;
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldownTimer: number = 0;

  // Combat
  public isAttacking: boolean = false;
  public attackStep: number = 1;
  public attackTimer: number = 0;
  public attackCooldownTimer: number = 0;
  public attackHitbox: Rect | null = null;
  public hasHitCurrentAttack: boolean = false;

  public shurikenCooldownTimer: number = 0;
  public invincibilityTimer: number = 0;

  // Dynamic Scarf Verlet Simulation (7 nodes)
  public scarfNodes: ScarfNode[] = [];
  public readonly scarfSegments = 7;
  public readonly scarfSegmentLength = 7.5;

  // Stats
  public stats: PlayerStats = {
    health: PLAYER_DEFAULTS.maxHealth,
    maxHealth: PLAYER_DEFAULTS.maxHealth,
    energy: PLAYER_DEFAULTS.maxEnergy,
    maxEnergy: PLAYER_DEFAULTS.maxEnergy,
    attack: 25,
    defense: 10,
    moveSpeed: PLAYER_DEFAULTS.moveSpeed,
    coins: 0,
    shurikens: 5,
    maxShurikens: 5,
    level: 1,
    xp: 0,
    xpToNext: 100,
  };

  constructor(charId: CharacterId = 'kairo') {
    this.characterId = charId;
    this.initScarf();
    this.applyCharacterPerks();
  }

  public applyCharacterPerks() {
    if (this.characterId === 'ren') {
      this.stats.moveSpeed = 380;
      this.stats.maxHealth = 85;
      this.stats.health = 85;
      this.stats.attack = 22;
    } else if (this.characterId === 'jin') {
      this.stats.moveSpeed = 320;
      this.stats.maxHealth = 130;
      this.stats.health = 130;
      this.stats.attack = 32;
    } else {
      this.stats.moveSpeed = PLAYER_DEFAULTS.moveSpeed;
      this.stats.maxHealth = PLAYER_DEFAULTS.maxHealth;
      this.stats.health = PLAYER_DEFAULTS.maxHealth;
      this.stats.attack = 25;
    }
  }

  public initScarf() {
    this.scarfNodes = [];
    for (let i = 0; i < this.scarfSegments; i++) {
      const nx = this.x - this.facing * i * this.scarfSegmentLength;
      const ny = this.y + 16 + i * 2;
      this.scarfNodes.push({ x: nx, y: ny, oldX: nx, oldY: ny });
    }
  }

  public respawn(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.stats.health = this.stats.maxHealth;
    this.stats.energy = this.stats.maxEnergy;
    this.anim = 'IDLE';
    this.isDashing = false;
    this.isAttacking = false;
    this.attackHitbox = null;
    this.initScarf();
  }

  public update(
    dt: number,
    input: {
      left: boolean;
      right: boolean;
      jump: boolean;
      jumpPressed: boolean;
      attackPressed: boolean;
      dashPressed: boolean;
      shurikenPressed: boolean;
      down: boolean;
    },
    platforms: Platform[],
    particles: ParticleSystem
  ): { throwShuriken: boolean } {
    let throwShuriken = false;
    this.animTimer += dt;

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= dt;
    }
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= dt;
    }
    if (this.shurikenCooldownTimer > 0) {
      this.shurikenCooldownTimer -= dt;
    }
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= dt;
    }

    // Passive energy recharge
    if (this.stats.energy < this.stats.maxEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + 12 * dt);
    }

    // --- DASH LOGIC ---
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * PLAYER_DEFAULTS.dashSpeed;
      this.vy = 0; // zero gravity during dash

      // Ghost trail particle
      if (Math.random() > 0.4) {
        particles.emitDashGhost(this.x, this.y, this.facing, this.anim, this.scarfNodes);
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx *= 0.5;
      }
    } else {
      // Trigger Dash
      if (input.dashPressed && this.dashCooldownTimer <= 0 && this.stats.energy >= 20) {
        this.isDashing = true;
        this.dashTimer = PLAYER_DEFAULTS.dashDuration;
        this.dashCooldownTimer = PLAYER_DEFAULTS.dashCooldown;
        this.stats.energy -= 20;
        this.invincibilityTimer = PLAYER_DEFAULTS.dashDuration + 0.05;
        this.anim = 'DASH';
        soundManager.playDash();
        particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, '#38bdf8');
      }

      // --- ATTACK LOGIC ---
      if (input.attackPressed && !this.isAttacking && this.attackCooldownTimer <= 0) {
        this.startAttack(particles);
      }

      if (this.isAttacking) {
        this.attackTimer -= dt;
        // Hitbox active during middle of swing
        if (this.attackTimer < 0.18 && this.attackTimer > 0.05) {
          const reach = 52;
          this.attackHitbox = {
            x: this.facing === 1 ? this.x + this.width - 5 : this.x - reach + 5,
            y: this.y + 8,
            width: reach,
            height: 48,
          };
        } else {
          this.attackHitbox = null;
        }

        if (this.attackTimer <= 0) {
          this.isAttacking = false;
          this.attackHitbox = null;
        }
      }

      // --- SHURIKEN LOGIC ---
      if (
        input.shurikenPressed &&
        this.shurikenCooldownTimer <= 0 &&
        this.stats.shurikens > 0
      ) {
        this.stats.shurikens--;
        this.shurikenCooldownTimer = PLAYER_DEFAULTS.shurikenCooldown;
        throwShuriken = true;
        soundManager.playShuriken();
      }

      // --- HORIZONTAL MOVEMENT ---
      let moveDir = 0;
      if (input.left) moveDir -= 1;
      if (input.right) moveDir += 1;

      if (!this.isAttacking || !this.isGrounded) {
        if (moveDir !== 0) {
          this.vx = moveDir * this.stats.moveSpeed;
          this.facing = moveDir as 1 | -1;
        } else {
          this.vx *= 0.65; // friction
          if (Math.abs(this.vx) < 10) this.vx = 0;
        }
      } else {
        this.vx *= 0.7; // attack lunging friction
      }

      // --- GRAVITY & VERTICAL MOVEMENT ---
      if (this.isTouchingWall && !this.isGrounded && this.vy > 0 && moveDir === this.wallDirection) {
        // Wall sliding
        this.vy = Math.min(this.vy, WALL_SLIDE_SPEED);
        this.anim = 'WALL_SLIDE';
        if (Math.random() > 0.6) {
          particles.emitHitSparks(
            this.wallDirection === 1 ? this.x + this.width : this.x,
            this.y + this.height - 10,
            '#e2e8f0',
            2
          );
        }
      } else {
        this.vy = Math.min(this.vy + GRAVITY * dt, TERMINAL_VELOCITY);
      }

      // --- JUMP LOGIC ---
      if (input.jumpPressed) {
        if (this.isGrounded) {
          this.vy = -PLAYER_DEFAULTS.jumpForce;
          this.isGrounded = false;
          this.canDoubleJump = true;
          soundManager.playJump();
          particles.emitSmokePoof(this.x + this.width / 2, this.y + this.height, '#64748b', 6);
        } else if (this.isTouchingWall) {
          // Wall jump
          this.vy = -PLAYER_DEFAULTS.jumpForce * 0.95;
          this.vx = -this.wallDirection * this.stats.moveSpeed * 1.15;
          this.facing = -this.wallDirection as 1 | -1;
          this.isTouchingWall = false;
          soundManager.playJump();
          particles.emitHitSparks(this.x + this.width / 2, this.y + this.height / 2, '#38bdf8', 8);
        } else if (this.canDoubleJump) {
          this.vy = -PLAYER_DEFAULTS.doubleJumpForce;
          this.canDoubleJump = false;
          soundManager.playDoubleJump();
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, '#ef4444');
        }
      }
    }

    // --- INTEGRATE POSITION & RESOLVE COLLISIONS ---
    this.resolveCollisions(dt, platforms, input.down);

    // --- DETERMINE ANIMATION ---
    if (!this.isDashing && !this.isAttacking) {
      if (this.isTouchingWall && !this.isGrounded && this.vy > 0) {
        this.anim = 'WALL_SLIDE';
      } else if (!this.isGrounded) {
        this.anim = this.vy < 0 ? 'JUMP' : 'FALL';
      } else if (Math.abs(this.vx) > 30) {
        this.anim = 'RUN';
      } else {
        this.anim = 'IDLE';
      }
    }

    // --- UPDATE VERLET SCARF ---
    this.updateScarf(dt);

    return { throwShuriken };
  }

  private startAttack(particles: ParticleSystem) {
    this.isAttacking = true;
    this.attackTimer = PLAYER_DEFAULTS.attackCooldown;
    this.attackCooldownTimer = PLAYER_DEFAULTS.attackCooldown + 0.05;
    this.hasHitCurrentAttack = false;

    // Advance 3-hit combo
    if (this.animTimer < 0.6) {
      this.attackStep = (this.attackStep % 3) + 1;
    } else {
      this.attackStep = 1;
    }
    this.animTimer = 0;

    this.anim = this.attackStep === 1 ? 'ATTACK_1' : this.attackStep === 2 ? 'ATTACK_2' : 'ATTACK_3';

    // Forward lunge
    this.vx += this.facing * 140;

    soundManager.playKatanaSlash(this.attackStep);
    particles.emitSlashArc(
      this.x + this.width / 2 + this.facing * 25,
      this.y + this.height / 2,
      this.facing,
      this.attackStep
    );
  }

  public takeDamage(damage: number, knockbackX: number = 0, particles?: ParticleSystem): boolean {
    if (this.invincibilityTimer > 0) return false;

    const actualDamage = Math.max(5, damage - this.stats.defense * 0.4);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    this.invincibilityTimer = PLAYER_DEFAULTS.invincibilityTime;
    this.anim = 'HURT';

    this.vx = knockbackX;
    this.vy = -280;

    soundManager.playHurt();
    if (particles) {
      particles.emitBloodMist(this.x + this.width / 2, this.y + this.height / 2, 10);
      particles.emitHitSparks(this.x + this.width / 2, this.y + this.height / 2, '#ef4444', 12);
    }

    if (this.stats.health <= 0) {
      this.anim = 'DEATH';
      return true; // dead
    }
    return false;
  }

  private resolveCollisions(dt: number, platforms: Platform[], pressingDown: boolean) {
    // Horizontal step
    this.x += this.vx * dt;
    this.isTouchingWall = false;

    const pRect = { x: this.x, y: this.y, width: this.width, height: this.height };

    for (const plat of platforms) {
      if (plat.type === 'one_way') continue; // horizontal collision ignores one-way

      if (this.checkOverlap(pRect, plat)) {
        if (this.vx > 0) {
          this.x = plat.x - this.width;
          this.isTouchingWall = true;
          this.wallDirection = 1;
        } else if (this.vx < 0) {
          this.x = plat.x + plat.width;
          this.isTouchingWall = true;
          this.wallDirection = -1;
        }
        this.vx = 0;
      }
    }

    // Vertical step
    this.y += this.vy * dt;
    this.isGrounded = false;
    pRect.x = this.x;
    pRect.y = this.y;

    for (const plat of platforms) {
      if (plat.type === 'one_way') {
        // Can jump up through, can stand on top if falling down and not holding Down
        const prevBottom = this.y - this.vy * dt + this.height;
        if (
          !pressingDown &&
          this.vy >= 0 &&
          prevBottom <= plat.y + 12 &&
          this.x + this.width > plat.x + 4 &&
          this.x < plat.x + plat.width - 4 &&
          this.y + this.height >= plat.y &&
          this.y + this.height <= plat.y + 18
        ) {
          this.y = plat.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.canDoubleJump = true;
        }
        continue;
      }

      if (this.checkOverlap(pRect, plat)) {
        if (this.vy > 0) {
          // Landing on platform
          this.y = plat.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.canDoubleJump = true;

          // Moving platform push
          if (plat.type === 'moving_horizontal' && plat.speed && plat.dir) {
            this.x += plat.speed * plat.dir * dt;
          }
        } else if (this.vy < 0) {
          // Hitting ceiling
          this.y = plat.y + plat.height;
          this.vy = 0;
        }
      }
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

  private updateScarf(dt: number) {
    if (this.scarfNodes.length === 0) return;

    // Anchor first node to player neck
    const neckX = this.x + this.width / 2 - this.facing * 4;
    const neckY = this.y + 18;
    this.scarfNodes[0].x = neckX;
    this.scarfNodes[0].y = neckY;

    // Verlet integration for the trailing nodes
    for (let i = 1; i < this.scarfNodes.length; i++) {
      const node = this.scarfNodes[i];
      const vx = (node.x - node.oldX) * 0.88;
      const vy = (node.y - node.oldY) * 0.88;

      node.oldX = node.x;
      node.oldY = node.y;

      // Wind and movement drag
      const windX = -this.facing * (Math.abs(this.vx) * 0.08 + 25);
      const windY = 40 + Math.sin(Date.now() * 0.008 + i) * 15;

      node.x += vx + windX * dt;
      node.y += vy + windY * dt;
    }

    // Distance constraint passes
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < this.scarfNodes.length - 1; i++) {
        const n1 = this.scarfNodes[i];
        const n2 = this.scarfNodes[i + 1];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const diff = (dist - this.scarfSegmentLength) / dist;

        if (i === 0) {
          n2.x -= dx * diff;
          n2.y -= dy * diff;
        } else {
          n1.x += dx * diff * 0.5;
          n1.y += dy * diff * 0.5;
          n2.x -= dx * diff * 0.5;
          n2.y -= dy * diff * 0.5;
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Blink if invincible
    if (this.invincibilityTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    ctx.save();

    // Render Scarf first (behind or flowing around Kairo)
    this.renderScarf(ctx);

    // Flip context if facing left
    ctx.translate(this.x + this.width / 2, this.y + this.height);
    ctx.scale(this.facing, 1);

    // Silhouette Ninja Body
    const darkBody = '#0b111e';
    const armorTone = '#1e293b';
    const accentGlow = this.characterId === 'ren' ? '#10b981' : this.characterId === 'jin' ? '#a855f7' : '#38bdf8';

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const runCycle = Math.sin(this.animTimer * 14);
    const legOffset = this.anim === 'RUN' ? runCycle * 10 : 0;

    // Back leg
    ctx.fillStyle = darkBody;
    ctx.fillRect(-12 - legOffset * 0.6, -26, 9, 26);
    // Front leg
    ctx.fillRect(3 + legOffset * 0.6, -26, 9, 26);

    // Torso / Dark Armor
    ctx.fillStyle = armorTone;
    ctx.beginPath();
    ctx.roundRect(-14, -52, 28, 28, 4);
    ctx.fill();

    // Chest plate detail
    ctx.fillStyle = darkBody;
    ctx.fillRect(-10, -48, 20, 18);

    // Belt and ninja pouch
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12, -26, 24, 4);

    // Head / Mask
    ctx.fillStyle = darkBody;
    ctx.beginPath();
    ctx.arc(0, -56, 11, 0, Math.PI * 2);
    ctx.fill();

    // Headband / Hood cowl
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -58, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // Luminous Mask Visor / Eyes
    ctx.fillStyle = accentGlow;
    ctx.shadowColor = accentGlow;
    ctx.shadowBlur = 8;
    ctx.fillRect(2, -58, 6, 3);
    ctx.shadowBlur = 0;

    // Arms and Katana
    this.renderKatanaAndArms(ctx, accentGlow);

    ctx.restore();
  }

  private renderKatanaAndArms(ctx: CanvasRenderingContext2D, glowColor: string) {
    const isAttacking = this.isAttacking;
    const step = this.attackStep;

    ctx.save();

    if (isAttacking) {
      if (step === 1) {
        // Forward thrust / horizontal cut
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, -45, 18, 7); // arm

        // Katana blade horizontal
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(18, -42);
        ctx.lineTo(48, -42);
        ctx.stroke();

        // Katana glow edge
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else if (step === 2) {
        // Upward arc
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, -48, 16, 7);

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(16, -45);
        ctx.lineTo(38, -75);
        ctx.stroke();

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else {
        // Heavy downward spinning strike
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, -42, 16, 7);

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(14, -38);
        ctx.lineTo(44, -18);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
    } else {
      // Idle / running sheathed or held katana
      // Arm
      ctx.fillStyle = '#1e293b';
      const armAngle = this.anim === 'RUN' ? Math.sin(this.animTimer * 14) * 0.3 : 0;
      ctx.save();
      ctx.translate(-4, -45);
      ctx.rotate(armAngle);
      ctx.fillRect(0, 0, 7, 18);
      ctx.restore();

      // Sheathed katana on back
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, -32);
      ctx.lineTo(-24, -62);
      ctx.stroke();

      // Golden hilt
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-24, -62);
      ctx.lineTo(-28, -72);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderScarf(ctx: CanvasRenderingContext2D) {
    if (this.scarfNodes.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#e11d48';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < this.scarfNodes.length - 1; i++) {
      const n1 = this.scarfNodes[i];
      const n2 = this.scarfNodes[i + 1];

      // Scarf tapers towards tail
      const thickness = Math.max(2.5, 7.5 - i * 0.8);
      ctx.lineWidth = thickness;

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
