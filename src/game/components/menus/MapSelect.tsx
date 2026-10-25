/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapId, LevelMetadata } from '../../types';
import { LEVELS_METADATA } from '../../engine/Levels';
import { ChevronLeft, Play, Lock, Star, Skull, Compass } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface MapSelectProps {
  unlockedMaps: MapId[];
  onSelectMap: (mapId: MapId) => void;
  onBack: () => void;
}

export const MapSelect: React.FC<MapSelectProps> = ({
  unlockedMaps,
  onSelectMap,
  onBack,
}) => {
  const mapList: LevelMetadata[] = [
    LEVELS_METADATA.shadow_forest,
    LEVELS_METADATA.frozen_temple,
    LEVELS_METADATA.lava_valley,
    LEVELS_METADATA.silent_cliffs,
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-[#05070d] overflow-y-auto">
      {/* Header */}
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
          Campaign Temples
        </h2>

        <div className="w-16" />
      </div>

      {/* 4 Original Maps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-auto py-6 max-w-4xl mx-auto w-full z-10">
        {mapList.map((level) => {
          const isUnlocked = unlockedMaps.includes(level.id);

          return (
            <div
              key={level.id}
              className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-200 backdrop-blur-md ${
                isUnlocked
                  ? 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/80 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                {/* Title & Difficulty Badge */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-cinzel font-bold text-white">{level.title}</h3>
                    <div className="text-xs text-cyan-400 font-semibold">{level.subtitle}</div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      level.difficulty === 'Beginner'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : level.difficulty === 'Intermediate'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                        : level.difficulty === 'Advanced'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                    }`}
                  >
                    {level.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 font-rajdhani leading-relaxed">
                  {level.description}
                </p>

                {/* Level details */}
                <div className="flex items-center gap-4 text-xs text-slate-300 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>3 Stars Available</span>
                  </div>
                  {level.bossName && (
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <Skull className="w-3.5 h-3.5" />
                      <span>Boss: {level.bossName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {isUnlocked ? (
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    onSelectMap(level.id);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Enter Mission</span>
                </button>
              ) : (
                <div className="w-full py-3 rounded-2xl bg-slate-900/60 text-slate-500 border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold font-cinzel uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Locked • Complete Previous Act</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 z-10 flex items-center justify-center gap-1.5">
        <Compass className="w-4 h-4" />
        <span>Conquer each temple to harness its elemental essence and unlock the next trial.</span>
      </div>
    </div>
  );
};
