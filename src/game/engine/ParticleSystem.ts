/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particle, ScarfNode, PlayerAnimation } from '../types';

export class ParticleSystem {
  public particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'smoke' || p.type === 'spark') {
        p.vx *= 0.95;
        p.vy *= 0.95;
      } else if (p.type === 'blood') {
        p.vy += 600 * dt; // gravity
      } else if (p.type === 'snow') {
        p.x += Math.sin(p.life * 4) * 20 * dt;
      } else if (p.type === 'petal') {
        p.x += Math.cos(p.life * 3) * 35 * dt;
        p.y += 40 * dt;
      } else if (p.type === 'ember') {
        p.y -= 45 * dt;
        p.x += Math.sin(p.life * 5) * 15 * dt;
      }

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public emitHitSparks(x: number, y: number, color: string = '#f59e0b', count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0.15 + Math.random() * 0.2,
        maxLife: 0.35,
        type: 'spark',
      });
    }
  }

  public emitBloodMist(x: number, y: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 2.5 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#ef4444' : '#991b1b',
        alpha: 1,
        life: 0.25 + Math.random() * 0.25,
        maxLife: 0.5,
        type: 'blood',
      });
    }
  }

  public emitSmokePoof(x: number, y: number, color: string = '#475569', count: number = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 6 + Math.random() * 10,
        color,
        alpha: 0.8,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        type: 'smoke',
      });
    }
  }

  public emitDashGhost(
    x: number,
    y: number,
    facing: 1 | -1,
    anim: PlayerAnimation,
    scarfNodes?: ScarfNode[]
  ) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 1,
      color: '#38bdf8',
      alpha: 0.6,
      life: 0.22,
      maxLife: 0.22,
      type: 'ghost',
      ghostState: {
        facing,
        anim,
        scarfNodes: scarfNodes ? JSON.parse(JSON.stringify(scarfNodes)) : undefined,
      },
    });
  }

  public emitSlashArc(x: number, y: number, facing: 1 | -1, comboStep: number) {
    this.particles.push({
      x,
      y,
      vx: facing * 40,
      vy: 0,
      size: 40 + comboStep * 10,
      color: comboStep === 3 ? '#ef4444' : '#38bdf8',
      alpha: 1,
      life: 0.16,
      maxLife: 0.16,
      type: 'slash',
      rotation: comboStep === 2 ? -0.4 : 0.2,
      rotSpeed: comboStep === 3 ? 4 : 2,
    });
  }

  public emitShockwave(x: number, y: number, color: string = '#38bdf8') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color,
      alpha: 0.9,
      life: 0.3,
      maxLife: 0.3,
      type: 'shockwave',
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'blood') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha)), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'petal') {
        ctx.fillStyle = '#f43f5e';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'snow') {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ember') {
        ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'slash') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, -0.6, 0.6);
        ctx.stroke();
      } else if (p.type === 'shockwave') {
        const radius = p.size + (1 - p.alpha) * 70;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
