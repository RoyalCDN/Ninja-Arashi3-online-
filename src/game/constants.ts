/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const VIRTUAL_WIDTH = 1280;
export const VIRTUAL_HEIGHT = 720;
export const ASPECT_RATIO = VIRTUAL_WIDTH / VIRTUAL_HEIGHT; // 16:9

export const GRAVITY = 1800; // pixels / second^2
export const TERMINAL_VELOCITY = 950;
export const WALL_SLIDE_SPEED = 180;

export const PLAYER_DEFAULTS = {
  moveSpeed: 340,
  jumpForce: 720,
  doubleJumpForce: 650,
  dashSpeed: 820,
  dashDuration: 0.22,
  dashCooldown: 1.1,
  shurikenCooldown: 0.45,
  attackCooldown: 0.28,
  invincibilityTime: 1.2,
  maxHealth: 100,
  maxEnergy: 100,
};

export const COLOR_PALETTE = {
  bgDark: '#05070d',
  bgNavy: '#0c1222',
  moonlightBlue: '#38bdf8',
  crimsonRed: '#ef4444',
  crimsonGlow: '#f43f5e',
  goldenYellow: '#f59e0b',
  jadeGreen: '#10b981',
  shadowBlack: '#020617',
  smokeGray: '#64748b',
};
