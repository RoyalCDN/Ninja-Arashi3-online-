/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameScreen,
  UserProfile,
  CharacterId,
  MapId,
  InputState,
  MultiplayerRoom,
} from './game/types';
import { soundManager } from './game/audio/SoundManager';
import { GameEngine } from './game/engine/GameEngine';
import { GameCanvas } from './game/components/GameCanvas';
import { GameHUD } from './game/components/GameHUD';
import { TouchControls } from './game/components/TouchControls';
import { MainMenu } from './game/components/menus/MainMenu';
import { CharacterSelect } from './game/components/menus/CharacterSelect';
import { MapSelect } from './game/components/menus/MapSelect';
import { MultiplayerLobby } from './game/components/menus/MultiplayerLobby';
import { PauseModal } from './game/components/menus/PauseModal';
import { VictoryModal, GameOverModal } from './game/components/menus/ResultsModals';
import { SettingsModal } from './game/components/menus/SettingsModal';
import { ProfileModal } from './game/components/menus/ProfileModal';
import { InventoryModal } from './game/components/menus/InventoryModal';
import { AuthModal } from './game/components/menus/AuthModal';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_guest',
  username: 'Kairo',
  email: 'guest@akarai.com',
  avatar: 'kairo',
  isGuest: true,
  coins: 150,
  level: 1,
  xp: 45,
  selectedCharacter: 'kairo',
  unlockedCharacters: ['kairo', 'ren'],
  unlockedMaps: ['shadow_forest', 'frozen_temple', 'lava_valley', 'silent_cliffs'],
  stats: {
    enemiesKilled: 14,
    bossesSlain: 1,
    deaths: 2,
    coinsCollected: 150,
    missionsCompleted: 2,
  },
  upgrades: {
    healthTier: 0,
    attackTier: 0,
    dashTier: 0,
    shurikenTier: 0,
  },
  settings: {
    masterVolume: 0.8,
    bgmVolume: 0.55,
    sfxVolume: 0.75,
    muted: false,
    screenShake: true,
    graphicsQuality: 'high',
    touchSize: 1.0,
  },
};

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<GameScreen>('MAIN_MENU');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ninja_areahi_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // Save profile changes to local storage
  const saveProfile = useCallback((updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('ninja_areahi_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Keyboard and Touch Input State
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressedThisFrame: false,
    attack: false,
    attackPressedThisFrame: false,
    dash: false,
    dashPressedThisFrame: false,
    shuriken: false,
    shurikenPressedThisFrame: false,
    special: false,
    specialPressedThisFrame: false,
    pause: false,
    pausePressedThisFrame: false,
  });

  // Game Engine instance
  const engineRef = useRef<GameEngine | null>(null);

  // Reactive HUD states
  const [hudStats, setHudStats] = useState(DEFAULT_PROFILE);
  const [hudScore, setHudScore] = useState<number>(0);
  const [levelTitle, setLevelTitle] = useState<string>('Shadow Forest');
  const [checkpointNotice, setCheckpointNotice] = useState<string | null>(null);
  const [bossState, setBossState] = useState<{ name: string; health: number; maxHealth: number } | null>(null);
  const [victoryStats, setVictoryStats] = useState<{ score: number; coins: number; timeElapsed: number } | null>(null);

  // Initialize or start level in GameEngine
  const launchLevel = useCallback(
    (mapId: MapId) => {
      soundManager.init();

      const engine = new GameEngine(userProfile.selectedCharacter, mapId, {
        onScoreUpdate: (score, coins) => {
          setHudScore(score);
          saveProfile({
            ...userProfile,
            coins: userProfile.coins + 1,
            stats: {
              ...userProfile.stats,
              coinsCollected: userProfile.stats.coinsCollected + 1,
            },
          });
        },
        onCheckpointReached: () => {
          setCheckpointNotice('TORII CHECKPOINT REACHED');
          setTimeout(() => setCheckpointNotice(null), 2500);
        },
        onVictory: (stats) => {
          setVictoryStats(stats);
          setScreen('VICTORY');
          // Update profile progression
          const nextCoins = userProfile.coins + stats.coins;
          const nextXP = userProfile.xp + 150;
          const nextLevel = Math.floor(nextXP / 150) + 1;
          saveProfile({
            ...userProfile,
            coins: nextCoins,
            xp: nextXP,
            level: nextLevel,
            stats: {
              ...userProfile.stats,
              missionsCompleted: userProfile.stats.missionsCompleted + 1,
              coinsCollected: userProfile.stats.coinsCollected + stats.coins,
            },
          });
        },
        onGameOver: () => {
          setScreen('GAME_OVER');
          saveProfile({
            ...userProfile,
            stats: {
              ...userProfile.stats,
              deaths: userProfile.stats.deaths + 1,
            },
          });
        },
        onBossStateChange: (boss) => {
          setBossState(boss);
        },
      });

      // Apply upgrades
      engine.player.stats.attack += userProfile.upgrades.attackTier * 6;
      engine.player.stats.maxHealth += userProfile.upgrades.healthTier * 20;
      engine.player.stats.health = engine.player.stats.maxHealth;
      engine.player.stats.maxShurikens += userProfile.upgrades.shurikenTier * 2;
      engine.player.stats.shurikens = engine.player.stats.maxShurikens;

      engineRef.current = engine;
      setLevelTitle(engine.level.metadata.title);
      setHudScore(0);
      setScreen('PLAYING');
    },
    [userProfile, saveProfile]
  );

  // Keyboard Event Listeners for Desktop gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundManager.init();
      const code = e.code;
      const inp = inputRef.current;

      if (code === 'KeyA' || code === 'ArrowLeft') inp.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inp.right = true;
      if (code === 'KeyS' || code === 'ArrowDown') inp.down = true;

      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        if (!inp.jump) inp.jumpPressedThisFrame = true;
        inp.jump = true;
      }
      if (code === 'KeyJ' || code === 'KeyZ') {
        if (!inp.attack) inp.attackPressedThisFrame = true;
        inp.attack = true;
      }
      if (code === 'KeyK' || code === 'KeyX') {
        if (!inp.dash) inp.dashPressedThisFrame = true;
        inp.dash = true;
      }
      if (code === 'KeyL' || code === 'KeyC') {
        if (!inp.shuriken) inp.shurikenPressedThisFrame = true;
        inp.shuriken = true;
      }
      if (code === 'Escape' || code === 'KeyP') {
        if (screen === 'PLAYING') {
          setScreen('PAUSED');
          if (engineRef.current) engineRef.current.isPaused = true;
        } else if (screen === 'PAUSED') {
          setScreen('PLAYING');
          if (engineRef.current) engineRef.current.isPaused = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const inp = inputRef.current;

      if (code === 'KeyA' || code === 'ArrowLeft') inp.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inp.right = false;
      if (code === 'KeyS' || code === 'ArrowDown') inp.down = false;
      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') inp.jump = false;
      if (code === 'KeyJ' || code === 'KeyZ') inp.attack = false;
      if (code === 'KeyK' || code === 'KeyX') inp.dash = false;
      if (code === 'KeyL' || code === 'KeyC') inp.shuriken = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Reset single-frame inputs after each tick
  useEffect(() => {
    const frameInterval = setInterval(() => {
      inputRef.current.jumpPressedThisFrame = false;
      inputRef.current.attackPressedThisFrame = false;
      inputRef.current.dashPressedThisFrame = false;
      inputRef.current.shurikenPressedThisFrame = false;
    }, 16);

    return () => clearInterval(frameInterval);
  }, []);

  // Sync Audio Volumes on load
  useEffect(() => {
    soundManager.setVolumes(
      userProfile.settings.masterVolume,
      userProfile.settings.bgmVolume,
      userProfile.settings.sfxVolume,
      userProfile.settings.muted
    );
  }, [userProfile.settings]);

  // Touch button callbacks from TouchControls
  const handleTouchInputDown = (
    action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken'
  ) => {
    const inp = inputRef.current;
    if (action === 'left') inp.left = true;
    if (action === 'right') inp.right = true;
    if (action === 'down') inp.down = true;
    if (action === 'jump') {
      inp.jump = true;
      inp.jumpPressedThisFrame = true;
    }
    if (action === 'attack') {
      inp.attack = true;
      inp.attackPressedThisFrame = true;
    }
    if (action === 'dash') {
      inp.dash = true;
      inp.dashPressedThisFrame = true;
    }
    if (action === 'shuriken') {
      inp.shuriken = true;
      inp.shurikenPressedThisFrame = true;
    }
  };

  const handleTouchInputUp = (
    action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken'
  ) => {
    const inp = inputRef.current;
    if (action === 'left') inp.left = false;
    if (action === 'right') inp.right = false;
    if (action === 'down') inp.down = false;
    if (action === 'jump') inp.jump = false;
    if (action === 'attack') inp.attack = false;
    if (action === 'dash') inp.dash = false;
    if (action === 'shuriken') inp.shuriken = false;
  };

  const isGameplayActive =
    screen === 'PLAYING' || screen === 'PAUSED' || screen === 'VICTORY' || screen === 'GAME_OVER';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070d] text-slate-100 flex flex-col justify-center items-center">
      {/* Active 2D HTML5 Canvas Game Viewport */}
      {isGameplayActive && (
        <div className="relative w-full h-full flex items-center justify-center">
          <GameCanvas engine={engineRef.current} inputState={inputRef.current} />

          {/* In-Game HUD overlay */}
          {engineRef.current && (
            <GameHUD
              stats={engineRef.current.player.stats}
              score={hudScore}
              levelTitle={levelTitle}
              checkpointNotification={checkpointNotice}
              bossState={bossState}
            />
          )}

          {/* Responsive Mobile Touch Controls */}
          {screen === 'PLAYING' && (
            <TouchControls
              onInputDown={handleTouchInputDown}
              onInputUp={handleTouchInputUp}
              onPauseToggle={() => {
                if (engineRef.current) engineRef.current.isPaused = true;
                setScreen('PAUSED');
              }}
              touchScale={userProfile.settings.touchSize}
            />
          )}

          {/* Pause Modal */}
          {screen === 'PAUSED' && (
            <PauseModal
              onResume={() => {
                if (engineRef.current) engineRef.current.isPaused = false;
                setScreen('PLAYING');
              }}
              onRestartCheckpoint={() => {
                if (engineRef.current) {
                  engineRef.current.respawnAtCheckpoint();
                  engineRef.current.isPaused = false;
                }
                setScreen('PLAYING');
              }}
              onExitToMapSelect={() => {
                soundManager.stopBGM();
                setScreen('STORY_LEVELS');
              }}
              onExitToMainMenu={() => {
                soundManager.stopBGM();
                soundManager.playBGM('menu');
                setScreen('MAIN_MENU');
              }}
              isMuted={userProfile.settings.muted}
              onToggleMute={() => {
                const updatedMuted = !userProfile.settings.muted;
                const updated = {
                  ...userProfile,
                  settings: { ...userProfile.settings, muted: updatedMuted },
                };
                saveProfile(updated);
                soundManager.setVolumes(
                  updated.settings.masterVolume,
                  updated.settings.bgmVolume,
                  updated.settings.sfxVolume,
                  updatedMuted
                );
              }}
            />
          )}

          {/* Victory Modal */}
          {screen === 'VICTORY' && (
            <VictoryModal
              score={victoryStats?.score || hudScore}
              coins={victoryStats?.coins || 25}
              timeElapsed={victoryStats?.timeElapsed || 45}
              levelTitle={levelTitle}
              onNextLevel={() => {
                if (engineRef.current?.currentMapId === 'shadow_forest') {
                  launchLevel('frozen_temple');
                } else if (engineRef.current?.currentMapId === 'frozen_temple') {
                  launchLevel('lava_valley');
                } else if (engineRef.current?.currentMapId === 'lava_valley') {
                  launchLevel('silent_cliffs');
                } else {
                  launchLevel('shadow_forest');
                }
              }}
              onReplay={() => {
                if (engineRef.current) {
                  launchLevel(engineRef.current.currentMapId);
                }
              }}
              onMainMenu={() => {
                soundManager.stopBGM();
                soundManager.playBGM('menu');
                setScreen('MAIN_MENU');
              }}
            />
          )}

          {/* Game Over Modal */}
          {screen === 'GAME_OVER' && (
            <GameOverModal
              onRespawnCheckpoint={() => {
                if (engineRef.current) {
                  engineRef.current.respawnAtCheckpoint();
                }
                setScreen('PLAYING');
              }}
              onRestartMission={() => {
                if (engineRef.current) {
                  launchLevel(engineRef.current.currentMapId);
                }
              }}
              onMainMenu={() => {
                soundManager.stopBGM();
                soundManager.playBGM('menu');
                setScreen('MAIN_MENU');
              }}
            />
          )}
        </div>
      )}

      {/* Main Menu Screen */}
      {screen === 'MAIN_MENU' && (
        <MainMenu
          userProfile={userProfile}
          onNavigate={(newScreen) => setScreen(newScreen)}
          onStartStory={() => launchLevel('shadow_forest')}
          onStartTraining={() => launchLevel('dojo_training')}
          onLogout={() => setShowAuthModal(true)}
        />
      )}

      {/* Character Select Screen */}
      {screen === 'CHARACTER_SELECT' && (
        <CharacterSelect
          selectedId={userProfile.selectedCharacter}
          unlockedCharacters={userProfile.unlockedCharacters}
          userCoins={userProfile.coins}
          onSelectCharacter={(charId) => {
            saveProfile({ ...userProfile, selectedCharacter: charId });
          }}
          onUnlockCharacter={(charId, cost) => {
            saveProfile({
              ...userProfile,
              coins: userProfile.coins - cost,
              selectedCharacter: charId,
              unlockedCharacters: [...userProfile.unlockedCharacters, charId],
            });
          }}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Map Select Screen */}
      {screen === 'STORY_LEVELS' && (
        <MapSelect
          unlockedMaps={userProfile.unlockedMaps}
          onSelectMap={(mapId) => launchLevel(mapId)}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Online Multiplayer Lobby */}
      {screen === 'MULTIPLAYER_LOBBY' && (
        <MultiplayerLobby
          userProfile={userProfile}
          onStartMultiplayerMatch={(room: MultiplayerRoom) => {
            launchLevel(room.mapId);
          }}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Settings Screen */}
      {screen === 'SETTINGS' && (
        <SettingsModal
          settings={userProfile.settings}
          onUpdateSettings={(newSettings) => {
            saveProfile({
              ...userProfile,
              settings: { ...userProfile.settings, ...newSettings },
            });
          }}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Profile & Achievements Screen */}
      {screen === 'PROFILE' && (
        <ProfileModal
          userProfile={userProfile}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Armory & Upgrades Screen */}
      {screen === 'INVENTORY' && (
        <InventoryModal
          userProfile={userProfile}
          onUpgradeTier={(tierKey, cost) => {
            saveProfile({
              ...userProfile,
              coins: userProfile.coins - cost,
              upgrades: {
                ...userProfile.upgrades,
                [tierKey]: userProfile.upgrades[tierKey] + 1,
              },
            });
          }}
          onBack={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Auth & Registration Modal */}
      {showAuthModal && (
        <div className="absolute inset-0 z-50">
          <AuthModal
            onAuthSuccess={(profile) => {
              saveProfile(profile);
              setShowAuthModal(false);
            }}
            onContinueAsGuest={() => {
              setShowAuthModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
