/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterId, CharacterInfo } from '../../types';
import { ChevronLeft, Check, Shield, Zap, Sword, Lock } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface CharacterSelectProps {
  selectedId: CharacterId;
  unlockedCharacters: CharacterId[];
  userCoins: number;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId, cost: number) => void;
  onBack: () => void;
}

export const CHARACTERS: CharacterInfo[] = [
  {
    id: 'kairo',
    name: 'Kairo',
    title: 'The Shadow Ronin',
    description: 'The chosen warrior of Akarai. Clad in dark stealth armor with a flowing crimson scarf and razor-sharp katana.',
    specialAbilityName: 'Shadow Dash',
    specialAbilityDesc: 'Warps through physical obstacles and attacks with lingering afterimages.',
    baseHealth: 100,
    baseAttack: 25,
    baseSpeed: 340,
    accentColor: '#38bdf8',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'ren',
    name: 'Ren',
    title: 'Mistress of the Zephyr',
    description: 'An agile shinobi master of the mountain winds. Unmatched movement velocity and double-jump recovery.',
    specialAbilityName: 'Gale Burst',
    specialAbilityDesc: 'High-speed directional sprint that leaves slicing wind blades in her wake.',
    baseHealth: 85,
    baseAttack: 22,
    baseSpeed: 380,
    accentColor: '#10b981',
    unlocked: true,
    cost: 150,
  },
  {
    id: 'jin',
    name: 'Jin',
    title: 'Cyber Samurai',
    description: 'An exiled guardian equipped with energized cyber-armor and heavy thunder cleavers.',
    specialAbilityName: 'Plasma Shockwave',
    specialAbilityDesc: 'Heavy ground slam emitting an electrified shockwave that stuns surrounding foes.',
    baseHealth: 130,
    baseAttack: 32,
    baseSpeed: 320,
    accentColor: '#a855f7',
    unlocked: false,
    cost: 300,
  },
];

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedId,
  unlockedCharacters,
  userCoins,
  onSelectCharacter,
  onUnlockCharacter,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-[#05070d] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>

        <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-slate-100 tracking-wider">
          Select Shinobi
        </h2>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-bold">
          🪙 {userCoins}
        </div>
      </div>

      {/* Characters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 my-auto py-6 max-w-5xl mx-auto w-full z-10">
        {CHARACTERS.map((char) => {
          const isUnlocked = unlockedCharacters.includes(char.id);
          const isSelected = selectedId === char.id;

          return (
            <div
              key={char.id}
              className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-200 backdrop-blur-md ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-1 ring-cyan-400'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Character Name & Silhouette Tag */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-cinzel font-bold text-white">{char.name}</h3>
                    <div className="text-xs font-semibold" style={{ color: char.accentColor }}>
                      {char.title}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 font-rajdhani leading-relaxed">
                  {char.description}
                </p>

                {/* Character Stats Bars */}
                <div className="space-y-2 mb-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <Shield className="w-3.5 h-3.5" /> Vitality
                    </span>
                    <span className="font-bold text-slate-200">{char.baseHealth} HP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Sword className="w-3.5 h-3.5" /> Katana Strike
                    </span>
                    <span className="font-bold text-slate-200">{char.baseAttack} ATK</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Zap className="w-3.5 h-3.5" /> Agility
                    </span>
                    <span className="font-bold text-slate-200">{char.baseSpeed} SPD</span>
                  </div>
                </div>

                {/* Special Ability Pill */}
                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 mb-4">
                  <div className="text-[11px] font-bold text-slate-300">
                    ⚡ {char.specialAbilityName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {char.specialAbilityDesc}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isUnlocked ? (
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    onSelectCharacter(char.id);
                  }}
                  className={`w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSelected ? 'Equipped' : 'Select Hero'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (userCoins >= char.cost) {
                      soundManager.playCheckpoint();
                      onUnlockCharacter(char.id, char.cost);
                    } else {
                      soundManager.playHurt();
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    userCoins >= char.cost
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                      : 'bg-slate-800/60 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock ({char.cost} Coins)</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        Each shinobi has unique sword arcs, acrobatic momentum, and tactical perks.
      </div>
    </div>
  );
};
