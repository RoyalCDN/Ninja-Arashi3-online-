/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen =
  | 'TITLE'
  | 'MAIN_MENU'
  | 'STORY_LEVELS'
  | 'CHARACTER_SELECT'
  | 'TRAINING_DOJO'
  | 'MULTIPLAYER_LOBBY'
  | 'PROFILE'
  | 'INVENTORY'
  | 'SETTINGS'
  | 'ACHIEVEMENTS'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export type CharacterId = 'kairo' | 'ren' | 'jin';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  specialAbilityName: string;
  specialAbilityDesc: string;
  baseHealth: number;
  baseAttack: number;
  baseSpeed: number;
  accentColor: string;
  unlocked: boolean;
  cost: number;
}

export type MapId = 'shadow_forest' | 'frozen_temple' | 'lava_valley' | 'silent_cliffs' | 'dojo_training';

export interface LevelMetadata {
  id: MapId;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  description: string;
  theme: 'forest' | 'ice' | 'lava' | 'cliffs' | 'dojo';
  unlocked: boolean;
  requiredStars: number;
  bestScore: number;
  starsEarned: number;
  worldLength: number;
  bossName?: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  moveSpeed: number;
  coins: number;
  shurikens: number;
  maxShurikens: number;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface ScarfNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

export type PlayerAnimation =
  | 'IDLE'
  | 'RUN'
  | 'JUMP'
  | 'FALL'
  | 'WALL_SLIDE'
  | 'ATTACK_1'
  | 'ATTACK_2'
  | 'ATTACK_3'
  | 'DASH'
  | 'HURT'
  | 'DEATH'
  | 'VICTORY';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform extends Rect {
  type: 'solid' | 'one_way' | 'ice' | 'moving_horizontal' | 'moving_vertical' | 'crumbling';
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  speed?: number;
  dir?: number;
  crumbleTimer?: number;
  isCrumbling?: boolean;
}

export interface Hazard extends Rect {
  type: 'spikes' | 'lava' | 'sawblade' | 'pendulum' | 'icicle';
  damage: number;
  rotation?: number;
  swingSpeed?: number;
  angle?: number;
  swingRadius?: number;
  pivotX?: number;
  pivotY?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'coin' | 'energy_orb' | 'health_flask' | 'shuriken_bundle' | 'scroll';
  value: number;
  collected: boolean;
  bobOffset: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

export interface ExitPortal {
  x: number;
  y: number;
  width: number;
  height: number;
  opened: boolean;
}

export type EnemyType =
  | 'SHADOW_SCOUT'
  | 'FOREST_GUARDIAN'
  | 'FROST_WARRIOR'
  | 'LAVA_BRUTE'
  | 'SILENT_ASSASSIN'
  | 'BOSS_AKUMA';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1;
  patrolMinX: number;
  patrolMaxX: number;
  state: 'PATROL' | 'CHASE' | 'ATTACK' | 'HURT' | 'DEAD' | 'SPECIAL';
  attackTimer: number;
  attackCooldown: number;
  detectionRange: number;
  attackRange: number;
  damage: number;
  moveSpeed: number;
  hurtTimer: number;
  deadTimer: number;
  isBoss?: boolean;
  bossPhase?: number;
  specialTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromPlayer: boolean;
  lifetime: number;
  type: 'shuriken' | 'shadow_blast' | 'fireball' | 'ice_shard';
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'blood' | 'petal' | 'snow' | 'ember' | 'slash' | 'ghost' | 'shockwave';
  rotation?: number;
  rotSpeed?: number;
  ghostState?: {
    facing: 1 | -1;
    anim: PlayerAnimation;
    scarfNodes?: ScarfNode[];
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressedThisFrame: boolean;
  attack: boolean;
  attackPressedThisFrame: boolean;
  dash: boolean;
  dashPressedThisFrame: boolean;
  shuriken: boolean;
  shurikenPressedThisFrame: boolean;
  special: boolean;
  specialPressedThisFrame: boolean;
  pause: boolean;
  pausePressedThisFrame: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  coins: number;
  level: number;
  xp: number;
  selectedCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  unlockedMaps: MapId[];
  stats: {
    enemiesKilled: number;
    bossesSlain: number;
    deaths: number;
    coinsCollected: number;
    missionsCompleted: number;
  };
  upgrades: {
    healthTier: number;
    attackTier: number;
    dashTier: number;
    shurikenTier: number;
  };
  settings: {
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    muted: boolean;
    screenShake: boolean;
    graphicsQuality: 'low' | 'medium' | 'high';
    touchSize: number;
  };
}

export interface MultiplayerRoom {
  id: string;
  name: string;
  code: string;
  hostName: string;
  isPrivate: boolean;
  mode: 'COOP' | 'PVP';
  mapId: MapId;
  maxPlayers: number;
  players: {
    id: string;
    name: string;
    character: CharacterId;
    isReady: boolean;
    isHost: boolean;
    health: number;
    score: number;
    ping: number;
  }[];
  status: 'WAITING' | 'STARTING' | 'IN_GAME' | 'FINISHED';
  createdAt: number;
}
