/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home, Map } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onExitToMapSelect: () => void;
  onExitToMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartCheckpoint,
  onExitToMapSelect,
  onExitToMainMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <h2 className="text-2xl font-cinzel font-black tracking-widest text-slate-100 uppercase">
          Paused
        </h2>

        <p className="text-xs text-slate-400 font-rajdhani">
          Focus your chi. The shadows wait for no warrior.
        </p>

        <div className="space-y-2.5 pt-2">
          {/* Resume */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Battle</span>
          </button>

          {/* Restart at Checkpoint */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestartCheckpoint();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Respawn at Checkpoint</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onToggleMute();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          {/* Map Select */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onExitToMapSelect();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <Map className="w-4 h-4" />
            <span>Map Selection</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onExitToMainMenu();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
