/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy, Rect, Projectile } from '../types';
import { soundManager } from '../audio/SoundManager';
import { ParticleSystem } from './ParticleSystem';

export class EnemyManager {
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];

  public update(
    dt: number,
    playerRect: Rect,
    playerX: number,
    playerY: number,
    particles: ParticleSystem,
    onPlayerHit: (damage: number, knockbackX: number) => void
  ) {
    // Update existing projectiles
    this.updateProjectiles(dt, playerRect, particles, onPlayerHit);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.state === 'DEAD') {
        e.deadTimer -= dt;
        if (e.deadTimer <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (e.hurtTimer > 0) {
        e.hurtTimer -= dt;
      }
      if (e.attackTimer > 0) {
        e.attackTimer -= dt;
      }

      // Boss special ability timer
      if (e.isBoss) {
        e.specialTimer = (e.specialTimer || 0) + dt;
        if (e.health < e.maxHealth * 0.5 && e.bossPhase === 1) {
          e.bossPhase = 2;
          particles.emitShockwave(e.x + e.width / 2, e.y + e.height / 2, '#ef4444');
          soundManager.playCheckpoint();
        }
      }

      const distToPlayer = Math.hypot(
        playerX - (e.x + e.width / 2),
        playerY - (e.y + e.height / 2)
      );

      // AI States: PATROL, CHASE, ATTACK
      if (distToPlayer < e.detectionRange && e.state !== 'HURT') {
        e.facing = playerX > e.x + e.width / 2 ? 1 : -1;

        if (distToPlayer <= e.attackRange) {
          // Attack range
          e.vx = 0;
          if (e.attackTimer <= 0) {
            this.executeEnemyAttack(e, playerX, playerY, particles, onPlayerHit);
          }
        } else {
          // Chase
          e.state = 'CHASE';
          e.vx = e.facing * e.moveSpeed;
        }
      } else if (e.state !== 'HURT') {
        // Patrol
        e.state = 'PATROL';
        e.vx = e.facing * (e.moveSpeed * 0.6);

        if (e.x <= e.patrolMinX) {
          e.facing = 1;
        } else if (e.x + e.width >= e.patrolMaxX) {
          e.facing = -1;
        }
      }

      // Move enemy
      e.x += e.vx * dt;

      // Check contact damage if not hurt
      if (e.state !== 'HURT') {
        const eRect = { x: e.x, y: e.y, width: e.width, height: e.height };
        if (this.checkOverlap(playerRect, eRect)) {
          onPlayerHit(10, e.facing * 180);
        }
      }
    }
  }

  private executeEnemyAttack(
    e: Enemy,
    playerX: number,
    playerY: number,
    particles: ParticleSystem,
    onPlayerHit: (damage: number, knockbackX: number) => void
  ) {
    e.state = 'ATTACK';
    e.attackTimer = e.attackCooldown;

    if (e.isBoss) {
      // Boss Attack: Slash or Projectile burst
      if (Math.random() > 0.4) {
        // Shadow burst projectile
        soundManager.playShuriken();
        this.projectiles.push({
          id: `boss_proj_${Date.now()}_${Math.random()}`,
          x: e.x + (e.facing === 1 ? e.width : 0),
          y: e.y + e.height / 2 - 10,
          vx: e.facing * 340,
          vy: (playerY - e.y) * 0.5,
          radius: 12,
          damage: e.damage * 1.2,
          fromPlayer: false,
          lifetime: 3.5,
          type: e.bossPhase === 2 ? 'fireball' : 'shadow_blast',
          rotation: 0,
        });
      } else {
        // Heavy Boss Cleave
        particles.emitSlashArc(e.x + e.width / 2 + e.facing * 40, e.y + e.height / 2, e.facing, 3);
        soundManager.playKatanaSlash(3);
        onPlayerHit(e.damage, e.facing * 240);
      }
    } else if (e.type === 'SILENT_ASSASSIN') {
      // Throw shuriken
      soundManager.playShuriken();
      this.projectiles.push({
        id: `assassin_shuriken_${Date.now()}`,
        x: e.x + (e.facing === 1 ? e.width : 0),
        y: e.y + e.height / 2,
        vx: e.facing * 420,
        vy: 0,
        radius: 8,
        damage: e.damage,
        fromPlayer: false,
        lifetime: 3.0,
        type: 'shuriken',
        rotation: 0,
      });
    } else {
      // Melee strike
      soundManager.playKatanaSlash(1);
      particles.emitSlashArc(e.x + e.width / 2 + e.facing * 25, e.y + e.height / 2, e.facing, 1);
      onPlayerHit(e.damage, e.facing * 180);
    }
  }

  public damageEnemy(
    enemyId: string,
    damage: number,
    knockbackDir: 1 | -1,
    particles: ParticleSystem
  ): { defeated: boolean; score: number; coins: number; isBoss: boolean } {
    const e = this.enemies.find((item) => item.id === enemyId);
    if (!e || e.state === 'DEAD') return { defeated: false, score: 0, coins: 0, isBoss: false };

    e.health -= damage;
    e.hurtTimer = 0.22;
    e.state = 'HURT';
    e.vx = knockbackDir * 160;

    soundManager.playKatanaHit();
    particles.emitBloodMist(e.x + e.width / 2, e.y + e.height / 2, 8);
    particles.emitHitSparks(e.x + e.width / 2, e.y + e.height / 2, '#ef4444', 10);

    if (e.health <= 0) {
      e.state = 'DEAD';
      e.deadTimer = 0.45;
      soundManager.playEnemyDeath();
      particles.emitSmokePoof(e.x + e.width / 2, e.y + e.height / 2, '#334155', 18);
      particles.emitShockwave(e.x + e.width / 2, e.y + e.height / 2, '#f59e0b');

      const isBoss = !!e.isBoss;
      const score = isBoss ? 2500 : 150;
      const coins = isBoss ? 25 : Math.floor(Math.random() * 3) + 2;

      return { defeated: true, score, coins, isBoss };
    }

    return { defeated: false, score: 0, coins: 0, isBoss: !!e.isBoss };
  }

  private updateProjectiles(
    dt: number,
    playerRect: Rect,
    particles: ParticleSystem,
    onPlayerHit: (damage: number, knockbackX: number) => void
  ) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifetime -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += 18 * dt;

      if (p.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with player if projectile is from an enemy
      if (!p.fromPlayer) {
        const pRect = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };
        if (this.checkOverlap(playerRect, pRect)) {
          onPlayerHit(p.damage, p.vx > 0 ? 180 : -180);
          particles.emitHitSparks(p.x, p.y, '#f59e0b', 8);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Player shuriken hitting enemies
        for (const e of this.enemies) {
          if (e.state === 'DEAD') continue;
          const eRect = { x: e.x, y: e.y, width: e.width, height: e.height };
          const pRect = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };
          if (this.checkOverlap(eRect, pRect)) {
            this.damageEnemy(e.id, p.damage, p.vx > 0 ? 1 : -1, particles);
            particles.emitHitSparks(p.x, p.y, '#38bdf8', 10);
            this.projectiles.splice(i, 1);
            break;
          }
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

  public render(ctx: CanvasRenderingContext2D) {
    // Render Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'shuriken') {
        // Golden 4-point throwing star
        ctx.fillStyle = p.fromPlayer ? '#38bdf8' : '#ef4444';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-4, -10);
          ctx.lineTo(0, -14);
          ctx.lineTo(4, -10);
          ctx.closePath();
          ctx.fill();
        }
      } else if (p.type === 'fireball') {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Shadow blast
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#7e22ce';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render Enemies
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height);
      ctx.scale(e.facing, 1);

      // Flash white when hurt
      const isHurt = e.hurtTimer > 0;
      const bodyColor = isHurt ? '#ffffff' : '#090d16';

      if (e.isBoss) {
        // Boss "Akuma the Shadow Overlord"
        this.renderBoss(ctx, e, bodyColor);
      } else {
        // Standard Minions
        this.renderMinion(ctx, e, bodyColor);
      }

      // Overhead Health Bar
      if (e.health < e.maxHealth && !e.isBoss) {
        ctx.save();
        ctx.scale(e.facing, 1); // undo flip for health bar text/rect
        const hpPct = Math.max(0, e.health / e.maxHealth);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-20, -e.height - 14, 40, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-19, -e.height - 13, 38 * hpPct, 3);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  private renderMinion(ctx: CanvasRenderingContext2D, e: Enemy, bodyColor: string) {
    // Feet
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-10, -18, 7, 18);
    ctx.fillRect(3, -18, 7, 18);

    // Torso
    ctx.fillRect(-12, -40, 24, 24);

    // Armor accent
    ctx.fillStyle = e.type === 'FROST_WARRIOR' ? '#0284c7' : e.type === 'LAVA_BRUTE' ? '#ea580c' : '#475569';
    ctx.fillRect(-8, -36, 16, 16);

    // Head / Mask
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -48, 10, 0, Math.PI * 2);
    ctx.fill();

    // Red demon eyes
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.fillRect(2, -50, 4, 3);
    ctx.shadowBlur = 0;

    // Weapon
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(8, -34, 18, 4);
  }

  private renderBoss(ctx: CanvasRenderingContext2D, e: Enemy, bodyColor: string) {
    // Massive Shadow Overlord with horns and dual greatswords
    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-22, -32, 16, 32);
    ctx.fillRect(6, -32, 16, 32);

    // Huge Armor Torso
    ctx.fillStyle = e.bossPhase === 2 ? '#7f1d1d' : '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(-28, -75, 56, 45, 6);
    ctx.fill();

    // Chest Skull Crest
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -56, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Horned Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -88, 16, 0, Math.PI * 2);
    ctx.fill();

    // Curved Horns
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-10, -96);
    ctx.quadraticCurveTo(-26, -120, -32, -100);
    ctx.lineTo(-12, -90);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -96);
    ctx.quadraticCurveTo(26, -120, 32, -100);
    ctx.lineTo(12, -90);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.fillRect(2, -92, 8, 4);
    ctx.shadowBlur = 0;

    // Giant Broadsword
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(20, -65);
    ctx.lineTo(55, -115);
    ctx.stroke();

    ctx.strokeStyle = e.bossPhase === 2 ? '#ef4444' : '#a855f7';
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 12;
    ctx.stroke();
  }
}
