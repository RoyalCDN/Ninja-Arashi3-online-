/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface VictoryModalProps {
  score: number;
  coins: number;
  timeElapsed: number;
  levelTitle: string;
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  timeElapsed,
  levelTitle,
  onNextLevel,
  onReplay,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-slate-900/95 border-2 border-emerald-500/70 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-4">
        {/* Animated Trophy Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-300">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mission Accomplished</span>
          </div>
          <h2 className="text-2xl font-cinzel font-black text-white tracking-wider">
            {levelTitle}
          </h2>
        </div>

        {/* 3 Stars Fanfare */}
        <div className="flex justify-center gap-2 py-1">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
            <div className="text-sm font-bold text-cyan-300 font-rajdhani">{score}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Coins</div>
            <div className="text-sm font-bold text-amber-300 font-rajdhani">+{coins}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Time</div>
            <div className="text-sm font-bold text-slate-200 font-rajdhani">{timeElapsed}s</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onNextLevel();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all active:scale-95 border border-emerald-400/50"
          >
            <span>Next Act</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onReplay();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onMainMenu();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  onRespawnCheckpoint: () => void;
  onRestartMission: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRespawnCheckpoint,
  onRestartMission,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-slate-900/95 border-2 border-rose-700/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(225,29,72,0.35)] text-center space-y-4">
        <h2 className="text-3xl font-cinzel font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-rose-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] uppercase">
          Defeated
        </h2>

        <p className="text-xs text-slate-400 font-rajdhani">
          Your shadow has dissipated into the mist. Rise again, Shinobi!
        </p>

        <div className="space-y-2.5 pt-2">
          {/* Respawn Checkpoint */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRespawnCheckpoint();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer transition-all active:scale-95 border border-rose-400/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Respawn at Torii Gate</span>
          </button>

          {/* Restart from beginning */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestartMission();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <span>Restart Level</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Temple Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
