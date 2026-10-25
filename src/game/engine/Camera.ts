/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../constants';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;

  public minX: number = 0;
  public maxX: number = 4000;
  public minY: number = 0;
  public maxY: number = 720;

  public shakeMagnitude: number = 0;
  public shakeDuration: number = 0;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerFacing: 1 | -1,
    screenShakeEnabled: boolean = true
  ) {
    // Lookahead offset based on player facing direction
    const lookahead = playerFacing * 90;
    this.targetX = playerX + lookahead - VIRTUAL_WIDTH / 2;
    this.targetY = playerY - VIRTUAL_HEIGHT / 2 - 40;

    // Smooth Lerp
    const lerpSpeed = 7.5;
    this.x += (this.targetX - this.x) * Math.min(1, lerpSpeed * dt);
    this.y += (this.targetY - this.y) * Math.min(1, lerpSpeed * dt);

    // Clamp within level bounds
    this.x = Math.max(this.minX, Math.min(this.maxX - VIRTUAL_WIDTH, this.x));
    this.y = Math.max(this.minY, Math.min(this.maxY - VIRTUAL_HEIGHT, this.y));

    // Screen Shake
    if (this.shakeDuration > 0 && screenShakeEnabled) {
      this.shakeDuration -= dt;
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeMagnitude;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeMagnitude;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public triggerShake(magnitude: number = 6, duration: number = 0.2) {
    this.shakeMagnitude = magnitude;
    this.shakeDuration = duration;
  }

  public apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(
      -Math.round(this.x + this.shakeOffsetX),
      -Math.round(this.y + this.shakeOffsetY)
    );
  }
}
