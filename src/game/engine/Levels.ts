/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MapId,
  Platform,
  Hazard,
  Collectible,
  Checkpoint,
  ExitPortal,
  Enemy,
  LevelMetadata,
} from '../types';

export interface LevelData {
  metadata: LevelMetadata;
  spawnX: number;
  spawnY: number;
  platforms: Platform[];
  hazards: Hazard[];
  collectibles: Collectible[];
  checkpoints: Checkpoint[];
  exitPortal: ExitPortal;
  enemies: Enemy[];
  worldWidth: number;
  worldHeight: number;
  skyColor: string;
  mountainColor: string;
  foliageColor: string;
  ambientParticleType: 'petal' | 'snow' | 'ember' | 'spark' | 'smoke';
}

export const LEVELS_METADATA: Record<MapId, LevelMetadata> = {
  shadow_forest: {
    id: 'shadow_forest',
    title: 'Shadow Forest',
    subtitle: 'Act I — Whispering Pines',
    difficulty: 'Beginner',
    description: 'Ancient bamboo forest bathed in pale moonlight. Master your ninja acrobatics and purge the shadow scouts.',
    theme: 'forest',
    unlocked: true,
    requiredStars: 0,
    bestScore: 0,
    starsEarned: 3,
    worldLength: 3600,
  },
  frozen_temple: {
    id: 'frozen_temple',
    title: 'Frozen Temple',
    subtitle: 'Act II — Glacial Sanctuary',
    difficulty: 'Intermediate',
    description: 'Slippery ice ledges and biting blizzards atop the sacred mountain. Beware frost warriors guarding the frozen relic.',
    theme: 'ice',
    unlocked: true,
    requiredStars: 1,
    bestScore: 0,
    starsEarned: 2,
    worldLength: 4200,
  },
  lava_valley: {
    id: 'lava_valley',
    title: 'Lava Valley',
    subtitle: 'Act III — Molten Crags',
    difficulty: 'Advanced',
    description: 'Perilous moving platforms suspended above rivers of searing magma. Timing and shadow dashes are vital.',
    theme: 'lava',
    unlocked: true,
    requiredStars: 3,
    bestScore: 0,
    starsEarned: 0,
    worldLength: 4500,
  },
  silent_cliffs: {
    id: 'silent_cliffs',
    title: 'Silent Cliffs',
    subtitle: 'Act IV — Pagoda of Akuma',
    difficulty: 'Master',
    description: 'Floating sky islands under an ominous eclipse. Confront Akuma the Shadow Overlord to restore balance.',
    theme: 'cliffs',
    unlocked: true,
    requiredStars: 5,
    bestScore: 0,
    starsEarned: 0,
    worldLength: 5000,
    bossName: 'Akuma the Shadow Overlord',
  },
  dojo_training: {
    id: 'dojo_training',
    title: 'Sacred Dojo',
    subtitle: 'Training Grounds',
    difficulty: 'Beginner',
    description: 'Hone your blade combos, shuriken aim, wall jumps, and shadow dashes in a tranquil sanctuary.',
    theme: 'dojo',
    unlocked: true,
    requiredStars: 0,
    bestScore: 0,
    starsEarned: 0,
    worldLength: 1800,
  },
};

export function loadLevel(mapId: MapId): LevelData {
  switch (mapId) {
    case 'shadow_forest':
      return createShadowForest();
    case 'frozen_temple':
      return createFrozenTemple();
    case 'lava_valley':
      return createLavaValley();
    case 'silent_cliffs':
      return createSilentCliffs();
    case 'dojo_training':
    default:
      return createDojo();
  }
}

function createShadowForest(): LevelData {
  const worldWidth = 3800;
  const worldHeight = 850;

  const platforms: Platform[] = [
    // Ground sections with gaps
    { x: 0, y: 620, width: 850, height: 230, type: 'solid' },
    { x: 950, y: 620, width: 650, height: 230, type: 'solid' },
    { x: 1700, y: 620, width: 750, height: 230, type: 'solid' },
    { x: 2600, y: 620, width: 1200, height: 230, type: 'solid' },

    // Elevated wooden platforms and temple roofs
    { x: 320, y: 480, width: 160, height: 22, type: 'one_way' },
    { x: 550, y: 390, width: 180, height: 22, type: 'one_way' },
    { x: 800, y: 310, width: 160, height: 22, type: 'one_way' },

    // Moving bridge
    {
      x: 1040,
      y: 450,
      width: 140,
      height: 20,
      type: 'moving_horizontal',
      minX: 1000,
      maxX: 1350,
      speed: 90,
      dir: 1,
    },

    // High temple pavilion
    { x: 1450, y: 440, width: 200, height: 24, type: 'one_way' },
    { x: 1750, y: 360, width: 220, height: 24, type: 'one_way' },
    { x: 2080, y: 280, width: 240, height: 24, type: 'one_way' },
    { x: 2400, y: 420, width: 160, height: 22, type: 'one_way' },

    // Final stretch watchtowers
    { x: 2800, y: 490, width: 160, height: 22, type: 'one_way' },
    { x: 3100, y: 390, width: 200, height: 24, type: 'one_way' },
  ];

  const hazards: Hazard[] = [
    // Spikes in ground pits
    { x: 850, y: 680, width: 100, height: 40, type: 'spikes', damage: 35 },
    { x: 1600, y: 680, width: 100, height: 40, type: 'spikes', damage: 35 },
    { x: 2450, y: 680, width: 150, height: 40, type: 'spikes', damage: 35 },
    // Spinning sawblade
    { x: 1250, y: 560, width: 36, height: 36, type: 'sawblade', damage: 25, rotation: 0 },
    { x: 2200, y: 560, width: 36, height: 36, type: 'sawblade', damage: 25, rotation: 0 },
  ];

  const collectibles: Collectible[] = [
    { id: 'c1', x: 360, y: 430, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 0 },
    { id: 'c2', x: 400, y: 430, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 0.5 },
    { id: 'c3', x: 620, y: 340, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 1 },
    { id: 'c4', x: 880, y: 260, radius: 12, type: 'shuriken_bundle', value: 3, collected: false, bobOffset: 1.5 },
    { id: 'c5', x: 1100, y: 380, radius: 12, type: 'energy_orb', value: 30, collected: false, bobOffset: 2 },
    { id: 'c6', x: 1520, y: 390, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 2.5 },
    { id: 'c7', x: 1820, y: 310, radius: 14, type: 'health_flask', value: 40, collected: false, bobOffset: 3 },
    { id: 'c8', x: 2150, y: 230, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 3.5 },
    { id: 'c9', x: 2900, y: 560, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 4 },
    { id: 'c10', x: 3180, y: 330, radius: 12, type: 'scroll', value: 100, collected: false, bobOffset: 4.5 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp_1', x: 1500, y: 520, width: 44, height: 100, activated: false },
    { id: 'cp_2', x: 2700, y: 520, width: 44, height: 100, activated: false },
  ];

  const exitPortal: ExitPortal = {
    x: 3550,
    y: 500,
    width: 60,
    height: 120,
    opened: true,
  };

  const enemies: Enemy[] = [
    {
      id: 'e1',
      type: 'SHADOW_SCOUT',
      x: 450,
      y: 560,
      vx: 0,
      vy: 0,
      width: 32,
      height: 60,
      health: 45,
      maxHealth: 45,
      facing: -1,
      patrolMinX: 300,
      patrolMaxX: 700,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.5,
      detectionRange: 280,
      attackRange: 45,
      damage: 15,
      moveSpeed: 130,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'e2',
      type: 'SHADOW_SCOUT',
      x: 1200,
      y: 560,
      vx: 0,
      vy: 0,
      width: 32,
      height: 60,
      health: 45,
      maxHealth: 45,
      facing: -1,
      patrolMinX: 1000,
      patrolMaxX: 1450,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.5,
      detectionRange: 280,
      attackRange: 45,
      damage: 15,
      moveSpeed: 130,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'e3',
      type: 'FOREST_GUARDIAN',
      x: 2100,
      y: 550,
      vx: 0,
      vy: 0,
      width: 40,
      height: 70,
      health: 80,
      maxHealth: 80,
      facing: -1,
      patrolMinX: 1850,
      patrolMaxX: 2350,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.8,
      detectionRange: 320,
      attackRange: 60,
      damage: 22,
      moveSpeed: 95,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'e4',
      type: 'FOREST_GUARDIAN',
      x: 3250,
      y: 550,
      vx: 0,
      vy: 0,
      width: 40,
      height: 70,
      health: 90,
      maxHealth: 90,
      facing: -1,
      patrolMinX: 3000,
      patrolMaxX: 3450,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.8,
      detectionRange: 320,
      attackRange: 60,
      damage: 24,
      moveSpeed: 100,
      hurtTimer: 0,
      deadTimer: 0,
    },
  ];

  return {
    metadata: LEVELS_METADATA.shadow_forest,
    spawnX: 80,
    spawnY: 540,
    platforms,
    hazards,
    collectibles,
    checkpoints,
    exitPortal,
    enemies,
    worldWidth,
    worldHeight,
    skyColor: '#070c18',
    mountainColor: '#0c1527',
    foliageColor: '#0f291e',
    ambientParticleType: 'petal',
  };
}

function createFrozenTemple(): LevelData {
  const worldWidth = 4200;
  const worldHeight = 850;

  const platforms: Platform[] = [
    { x: 0, y: 620, width: 700, height: 230, type: 'solid' },
    { x: 850, y: 620, width: 800, height: 230, type: 'solid' },
    { x: 1800, y: 620, width: 900, height: 230, type: 'solid' },
    { x: 2850, y: 620, width: 1350, height: 230, type: 'solid' },

    // Slippery ice bridges
    { x: 450, y: 480, width: 220, height: 20, type: 'ice' },
    { x: 750, y: 380, width: 240, height: 20, type: 'ice' },
    { x: 1100, y: 290, width: 240, height: 20, type: 'ice' },

    // Vertical lift
    {
      x: 1450,
      y: 400,
      width: 140,
      height: 20,
      type: 'moving_vertical',
      minY: 240,
      maxY: 520,
      speed: 80,
      dir: 1,
    },

    { x: 1750, y: 320, width: 260, height: 22, type: 'one_way' },
    { x: 2150, y: 420, width: 220, height: 20, type: 'ice' },
    { x: 2500, y: 340, width: 240, height: 20, type: 'ice' },
    { x: 2900, y: 480, width: 220, height: 22, type: 'one_way' },
    { x: 3250, y: 380, width: 260, height: 24, type: 'one_way' },
  ];

  const hazards: Hazard[] = [
    { x: 700, y: 680, width: 150, height: 40, type: 'spikes', damage: 40 },
    { x: 1650, y: 680, width: 150, height: 40, type: 'spikes', damage: 40 },
    { x: 2700, y: 680, width: 150, height: 40, type: 'spikes', damage: 40 },
    { x: 2350, y: 550, width: 36, height: 36, type: 'sawblade', damage: 30, rotation: 0 },
  ];

  const collectibles: Collectible[] = [
    { id: 'fc1', x: 500, y: 430, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 0 },
    { id: 'fc2', x: 800, y: 330, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 0.8 },
    { id: 'fc3', x: 1150, y: 240, radius: 14, type: 'health_flask', value: 45, collected: false, bobOffset: 1.6 },
    { id: 'fc4', x: 1800, y: 270, radius: 12, type: 'shuriken_bundle', value: 4, collected: false, bobOffset: 2.2 },
    { id: 'fc5', x: 2550, y: 290, radius: 12, type: 'energy_orb', value: 35, collected: false, bobOffset: 3 },
    { id: 'fc6', x: 3300, y: 330, radius: 12, type: 'scroll', value: 120, collected: false, bobOffset: 3.8 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp_ice_1', x: 1850, y: 520, width: 44, height: 100, activated: false },
    { id: 'cp_ice_2', x: 2950, y: 520, width: 44, height: 100, activated: false },
  ];

  const exitPortal: ExitPortal = {
    x: 3950,
    y: 500,
    width: 60,
    height: 120,
    opened: true,
  };

  const enemies: Enemy[] = [
    {
      id: 'fe1',
      type: 'FROST_WARRIOR',
      x: 1000,
      y: 550,
      vx: 0,
      vy: 0,
      width: 36,
      height: 66,
      health: 70,
      maxHealth: 70,
      facing: -1,
      patrolMinX: 900,
      patrolMaxX: 1350,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.6,
      detectionRange: 320,
      attackRange: 50,
      damage: 20,
      moveSpeed: 140,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'fe2',
      type: 'FROST_WARRIOR',
      x: 2300,
      y: 550,
      vx: 0,
      vy: 0,
      width: 36,
      height: 66,
      health: 80,
      maxHealth: 80,
      facing: -1,
      patrolMinX: 2000,
      patrolMaxX: 2600,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.6,
      detectionRange: 320,
      attackRange: 50,
      damage: 22,
      moveSpeed: 140,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'fe3',
      type: 'SILENT_ASSASSIN',
      x: 3500,
      y: 550,
      vx: 0,
      vy: 0,
      width: 32,
      height: 62,
      health: 65,
      maxHealth: 65,
      facing: -1,
      patrolMinX: 3100,
      patrolMaxX: 3800,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.2,
      detectionRange: 380,
      attackRange: 160,
      damage: 18,
      moveSpeed: 150,
      hurtTimer: 0,
      deadTimer: 0,
    },
  ];

  return {
    metadata: LEVELS_METADATA.frozen_temple,
    spawnX: 80,
    spawnY: 540,
    platforms,
    hazards,
    collectibles,
    checkpoints,
    exitPortal,
    enemies,
    worldWidth,
    worldHeight,
    skyColor: '#0a1426',
    mountainColor: '#1a2942',
    foliageColor: '#2d4665',
    ambientParticleType: 'snow',
  };
}

function createLavaValley(): LevelData {
  const worldWidth = 4500;
  const worldHeight = 850;

  const platforms: Platform[] = [
    { x: 0, y: 620, width: 650, height: 230, type: 'solid' },
    { x: 850, y: 620, width: 450, height: 230, type: 'solid' },
    { x: 1550, y: 620, width: 550, height: 230, type: 'solid' },
    { x: 2350, y: 620, width: 600, height: 230, type: 'solid' },
    { x: 3200, y: 620, width: 1300, height: 230, type: 'solid' },

    // Moving fiery platforms over molten lava
    {
      x: 670,
      y: 520,
      width: 140,
      height: 20,
      type: 'moving_horizontal',
      minX: 660,
      maxX: 840,
      speed: 100,
      dir: 1,
    },
    {
      x: 1320,
      y: 470,
      width: 150,
      height: 20,
      type: 'moving_horizontal',
      minX: 1300,
      maxX: 1540,
      speed: 110,
      dir: 1,
    },
    {
      x: 2130,
      y: 450,
      width: 150,
      height: 20,
      type: 'moving_horizontal',
      minX: 2100,
      maxX: 2340,
      speed: 110,
      dir: 1,
    },

    { x: 950, y: 440, width: 220, height: 22, type: 'one_way' },
    { x: 1700, y: 380, width: 240, height: 22, type: 'one_way' },
    { x: 2500, y: 350, width: 240, height: 22, type: 'one_way' },
    { x: 3400, y: 480, width: 220, height: 22, type: 'one_way' },
  ];

  const hazards: Hazard[] = [
    // Lethal molten lava in gaps
    { x: 650, y: 680, width: 200, height: 60, type: 'lava', damage: 60 },
    { x: 1300, y: 680, width: 250, height: 60, type: 'lava', damage: 60 },
    { x: 2100, y: 680, width: 250, height: 60, type: 'lava', damage: 60 },
    { x: 2950, y: 680, width: 250, height: 60, type: 'lava', damage: 60 },
    { x: 1800, y: 550, width: 40, height: 40, type: 'sawblade', damage: 30, rotation: 0 },
  ];

  const collectibles: Collectible[] = [
    { id: 'lc1', x: 740, y: 460, radius: 10, type: 'coin', value: 15, collected: false, bobOffset: 0 },
    { id: 'lc2', x: 1050, y: 390, radius: 12, type: 'energy_orb', value: 40, collected: false, bobOffset: 1 },
    { id: 'lc3', x: 1400, y: 410, radius: 10, type: 'coin', value: 15, collected: false, bobOffset: 2 },
    { id: 'lc4', x: 1780, y: 320, radius: 14, type: 'health_flask', value: 50, collected: false, bobOffset: 3 },
    { id: 'lc5', x: 2600, y: 300, radius: 12, type: 'scroll', value: 150, collected: false, bobOffset: 4 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp_lava_1', x: 1600, y: 520, width: 44, height: 100, activated: false },
    { id: 'cp_lava_2', x: 3250, y: 520, width: 44, height: 100, activated: false },
  ];

  const exitPortal: ExitPortal = {
    x: 4250,
    y: 500,
    width: 60,
    height: 120,
    opened: true,
  };

  const enemies: Enemy[] = [
    {
      id: 'le1',
      type: 'LAVA_BRUTE',
      x: 1000,
      y: 540,
      vx: 0,
      vy: 0,
      width: 44,
      height: 74,
      health: 120,
      maxHealth: 120,
      facing: -1,
      patrolMinX: 900,
      patrolMaxX: 1250,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.0,
      detectionRange: 300,
      attackRange: 60,
      damage: 28,
      moveSpeed: 85,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'le2',
      type: 'LAVA_BRUTE',
      x: 2500,
      y: 540,
      vx: 0,
      vy: 0,
      width: 44,
      height: 74,
      health: 130,
      maxHealth: 130,
      facing: -1,
      patrolMinX: 2400,
      patrolMaxX: 2850,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.0,
      detectionRange: 300,
      attackRange: 60,
      damage: 30,
      moveSpeed: 90,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'le3',
      type: 'SILENT_ASSASSIN',
      x: 3600,
      y: 540,
      vx: 0,
      vy: 0,
      width: 32,
      height: 62,
      health: 75,
      maxHealth: 75,
      facing: -1,
      patrolMinX: 3300,
      patrolMaxX: 4000,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.0,
      detectionRange: 360,
      attackRange: 160,
      damage: 22,
      moveSpeed: 150,
      hurtTimer: 0,
      deadTimer: 0,
    },
  ];

  return {
    metadata: LEVELS_METADATA.lava_valley,
    spawnX: 80,
    spawnY: 540,
    platforms,
    hazards,
    collectibles,
    checkpoints,
    exitPortal,
    enemies,
    worldWidth,
    worldHeight,
    skyColor: '#1b0808',
    mountainColor: '#300f0f',
    foliageColor: '#451a03',
    ambientParticleType: 'ember',
  };
}

function createSilentCliffs(): LevelData {
  const worldWidth = 4800;
  const worldHeight = 850;

  const platforms: Platform[] = [
    { x: 0, y: 620, width: 800, height: 230, type: 'solid' },
    { x: 1000, y: 620, width: 700, height: 230, type: 'solid' },
    { x: 1900, y: 620, width: 800, height: 230, type: 'solid' },
    // Boss Arena Ground
    { x: 2900, y: 620, width: 1900, height: 230, type: 'solid' },

    // Floating sky ledges
    { x: 400, y: 470, width: 180, height: 22, type: 'one_way' },
    { x: 680, y: 370, width: 180, height: 22, type: 'one_way' },
    { x: 1150, y: 440, width: 220, height: 22, type: 'one_way' },
    { x: 1450, y: 340, width: 240, height: 22, type: 'one_way' },
    { x: 2100, y: 450, width: 220, height: 22, type: 'one_way' },
    { x: 2400, y: 350, width: 220, height: 22, type: 'one_way' },

    // Boss Arena Pillars
    { x: 3200, y: 460, width: 160, height: 24, type: 'one_way' },
    { x: 3600, y: 380, width: 220, height: 24, type: 'one_way' },
    { x: 4050, y: 460, width: 160, height: 24, type: 'one_way' },
  ];

  const hazards: Hazard[] = [
    { x: 800, y: 680, width: 200, height: 40, type: 'spikes', damage: 50 },
    { x: 1700, y: 680, width: 200, height: 40, type: 'spikes', damage: 50 },
    { x: 2700, y: 680, width: 200, height: 40, type: 'spikes', damage: 50 },
  ];

  const collectibles: Collectible[] = [
    { id: 'sc1', x: 480, y: 420, radius: 10, type: 'coin', value: 20, collected: false, bobOffset: 0 },
    { id: 'sc2', x: 740, y: 320, radius: 14, type: 'health_flask', value: 50, collected: false, bobOffset: 1 },
    { id: 'sc3', x: 1520, y: 290, radius: 12, type: 'shuriken_bundle', value: 5, collected: false, bobOffset: 2 },
    { id: 'sc4', x: 2460, y: 300, radius: 12, type: 'energy_orb', value: 50, collected: false, bobOffset: 3 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp_cliffs_1', x: 1950, y: 520, width: 44, height: 100, activated: false },
    { id: 'cp_cliffs_boss', x: 3000, y: 520, width: 44, height: 100, activated: false },
  ];

  const exitPortal: ExitPortal = {
    x: 4550,
    y: 500,
    width: 60,
    height: 120,
    opened: false, // Opens upon defeating Boss!
  };

  const enemies: Enemy[] = [
    {
      id: 'se1',
      type: 'SILENT_ASSASSIN',
      x: 1250,
      y: 550,
      vx: 0,
      vy: 0,
      width: 32,
      height: 62,
      health: 80,
      maxHealth: 80,
      facing: -1,
      patrolMinX: 1050,
      patrolMaxX: 1650,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.8,
      detectionRange: 380,
      attackRange: 160,
      damage: 22,
      moveSpeed: 160,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'se2',
      type: 'SILENT_ASSASSIN',
      x: 2200,
      y: 550,
      vx: 0,
      vy: 0,
      width: 32,
      height: 62,
      health: 85,
      maxHealth: 85,
      facing: -1,
      patrolMinX: 2000,
      patrolMaxX: 2650,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.8,
      detectionRange: 380,
      attackRange: 160,
      damage: 22,
      moveSpeed: 160,
      hurtTimer: 0,
      deadTimer: 0,
    },
    // FINAL BOSS: AKUMA THE SHADOW OVERLORD
    {
      id: 'boss_akuma',
      type: 'BOSS_AKUMA',
      x: 3750,
      y: 500,
      vx: 0,
      vy: 0,
      width: 64,
      height: 120,
      health: 650,
      maxHealth: 650,
      facing: -1,
      patrolMinX: 3200,
      patrolMaxX: 4300,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 1.5,
      detectionRange: 600,
      attackRange: 120,
      damage: 32,
      moveSpeed: 130,
      hurtTimer: 0,
      deadTimer: 0,
      isBoss: true,
      bossPhase: 1,
      specialTimer: 0,
    },
  ];

  return {
    metadata: LEVELS_METADATA.silent_cliffs,
    spawnX: 80,
    spawnY: 540,
    platforms,
    hazards,
    collectibles,
    checkpoints,
    exitPortal,
    enemies,
    worldWidth,
    worldHeight,
    skyColor: '#05030a',
    mountainColor: '#120b24',
    foliageColor: '#2e1065',
    ambientParticleType: 'spark',
  };
}

function createDojo(): LevelData {
  const worldWidth = 1800;
  const worldHeight = 720;

  const platforms: Platform[] = [
    { x: 0, y: 580, width: 1800, height: 140, type: 'solid' },
    // Dojo training racks
    { x: 250, y: 440, width: 220, height: 22, type: 'one_way' },
    { x: 550, y: 340, width: 260, height: 22, type: 'one_way' },
    { x: 900, y: 440, width: 220, height: 22, type: 'one_way' },
    { x: 1250, y: 340, width: 280, height: 22, type: 'one_way' },
  ];

  const collectibles: Collectible[] = [
    { id: 'dc1', x: 300, y: 390, radius: 10, type: 'coin', value: 10, collected: false, bobOffset: 0 },
    { id: 'dc2', x: 600, y: 290, radius: 12, type: 'shuriken_bundle', value: 5, collected: false, bobOffset: 1 },
    { id: 'dc3', x: 1300, y: 290, radius: 12, type: 'energy_orb', value: 50, collected: false, bobOffset: 2 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp_dojo', x: 850, y: 480, width: 44, height: 100, activated: true },
  ];

  const exitPortal: ExitPortal = {
    x: 1650,
    y: 460,
    width: 60,
    height: 120,
    opened: true,
  };

  // Sparring dummy minion with respawning health
  const enemies: Enemy[] = [
    {
      id: 'dojo_dummy_1',
      type: 'SHADOW_SCOUT',
      x: 750,
      y: 520,
      vx: 0,
      vy: 0,
      width: 32,
      height: 60,
      health: 120,
      maxHealth: 120,
      facing: -1,
      patrolMinX: 680,
      patrolMaxX: 820,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.5,
      detectionRange: 200,
      attackRange: 40,
      damage: 5, // low damage for training
      moveSpeed: 60,
      hurtTimer: 0,
      deadTimer: 0,
    },
    {
      id: 'dojo_dummy_2',
      type: 'FOREST_GUARDIAN',
      x: 1400,
      y: 510,
      vx: 0,
      vy: 0,
      width: 40,
      height: 70,
      health: 200,
      maxHealth: 200,
      facing: -1,
      patrolMinX: 1350,
      patrolMaxX: 1550,
      state: 'PATROL',
      attackTimer: 0,
      attackCooldown: 2.5,
      detectionRange: 220,
      attackRange: 50,
      damage: 8,
      moveSpeed: 50,
      hurtTimer: 0,
      deadTimer: 0,
    },
  ];

  return {
    metadata: LEVELS_METADATA.dojo_training,
    spawnX: 120,
    spawnY: 500,
    platforms,
    hazards: [],
    collectibles,
    checkpoints,
    exitPortal,
    enemies,
    worldWidth,
    worldHeight,
    skyColor: '#0a0d18',
    mountainColor: '#111827',
    foliageColor: '#1e293b',
    ambientParticleType: 'petal',
  };
}
