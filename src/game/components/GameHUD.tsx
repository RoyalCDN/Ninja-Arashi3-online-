/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats } from '../types';
import { Disc, Coins, Heart, Zap, Award } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  score: number;
  levelTitle: string;
  checkpointNotification: string | null;
  bossState: { name: string; health: number; maxHealth: number } | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  score,
  levelTitle,
  checkpointNotification,
  bossState,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const energyPercent = Math.max(0, Math.min(100, (stats.energy / stats.maxEnergy) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header HUD */}
      <div className="w-full flex justify-between items-start gap-3">
        {/* Left: Player Status Bars */}
        <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2.5 sm:p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-2xl min-w-[190px] sm:min-w-[240px]">
          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <div className="relative flex-1 h-3.5 bg-slate-900 rounded-full overflow-hidden border border-rose-950">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-rose-300 w-12 text-right">
              {Math.ceil(stats.health)}/{stats.maxHealth}
            </span>
          </div>

          {/* Energy / Mana Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0" />
            <div className="relative flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-cyan-300 w-12 text-right">
              {Math.ceil(stats.energy)}
            </span>
          </div>
        </div>

        {/* Center: Level Title & Checkpoint Notification */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-950/70 border border-slate-800/60 px-4 py-1 rounded-full text-xs font-cinzel text-slate-300 tracking-wider shadow-lg">
            {levelTitle}
          </div>

          {checkpointNotification && (
            <div className="mt-2 bg-cyan-950/90 border border-cyan-500/80 px-4 py-1.5 rounded-xl text-xs font-bold text-cyan-300 tracking-widest uppercase shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-bounce">
              {checkpointNotification}
            </div>
          )}
        </div>

        {/* Right: Coins, Shurikens & Score */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 px-3 py-2 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-2xl">
          {/* Shurikens */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <Disc className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-rajdhani">{stats.shurikens}</span>
          </div>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Coins */}
          <div className="flex items-center gap-1.5 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-rajdhani">{stats.coins}</span>
          </div>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Score */}
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-rajdhani">{score}</span>
          </div>
        </div>
      </div>

      {/* Center Top: Boss Health Bar (if active) */}
      {bossState && (
        <div className="w-full flex justify-center mt-3">
          <div className="w-full max-w-lg bg-slate-950/90 border-2 border-red-700/80 p-2.5 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.35)] backdrop-blur-md">
            <div className="flex justify-between items-center mb-1 text-xs font-cinzel text-red-300 font-bold tracking-wider">
              <span>{bossState.name}</span>
              <span>{Math.ceil(bossState.health)} / {bossState.maxHealth}</span>
            </div>
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-red-950">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                style={{ width: `${Math.max(0, (bossState.health / bossState.maxHealth) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty bottom spacer to leave room for TouchControls */}
      <div />
    </div>
  );
};
