/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Sword,
  Zap,
  Disc,
  Pause,
} from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface TouchControlsProps {
  onInputDown: (action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken') => void;
  onInputUp: (action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken') => void;
  onPauseToggle: () => void;
  touchScale?: number; // 0.8 to 1.3
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputDown,
  onInputUp,
  onPauseToggle,
  touchScale = 1.0,
}) => {
  const activeTouches = useRef<Map<number, string>>(new Map());

  // Prevent default context menus and scrolling
  const handleTouchStart = (
    e: React.TouchEvent,
    action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken'
  ) => {
    e.preventDefault();
    soundManager.init(); // Initialize audio context on first touch
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      activeTouches.current.set(touch.identifier, action);
    }
    onInputDown(action);
  };

  const handleTouchEnd = (
    e: React.TouchEvent,
    action: 'left' | 'right' | 'down' | 'jump' | 'attack' | 'dash' | 'shuriken'
  ) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      activeTouches.current.delete(touch.identifier);
    }
    onInputUp(action);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5"
      style={{
        transform: `scale(${touchScale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* Top Header Bar with Pause */}
      <div className="w-full flex justify-end items-center pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onPauseToggle();
          }}
          aria-label="Pause Game"
          className="w-11 h-11 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-lg cursor-pointer"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full flex justify-between items-end pb-2">
        {/* Left Side: Directional D-Pad */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Left Button */}
          <button
            onTouchStart={(e) => handleTouchStart(e, 'left')}
            onTouchEnd={(e) => handleTouchEnd(e, 'left')}
            onTouchCancel={(e) => handleTouchEnd(e, 'left')}
            onMouseDown={() => onInputDown('left')}
            onMouseUp={() => onInputUp('left')}
            onMouseLeave={() => onInputUp('left')}
            aria-label="Move Left"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/70 text-slate-200 active:border-cyan-400 active:text-cyan-400 active:bg-cyan-950/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-2xl touch-none"
          >
            <ChevronLeft className="w-8 h-8 pointer-events-none" />
          </button>

          {/* Down Button (for dropping through one-way platforms) */}
          <button
            onTouchStart={(e) => handleTouchStart(e, 'down')}
            onTouchEnd={(e) => handleTouchEnd(e, 'down')}
            onTouchCancel={(e) => handleTouchEnd(e, 'down')}
            onMouseDown={() => onInputDown('down')}
            onMouseUp={() => onInputUp('down')}
            onMouseLeave={() => onInputUp('down')}
            aria-label="Drop Down"
            className="w-12 h-14 rounded-xl bg-slate-900/70 border border-slate-700/50 text-slate-400 active:border-cyan-400 active:text-cyan-400 active:bg-cyan-950/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-lg touch-none"
          >
            <ChevronDown className="w-6 h-6 pointer-events-none" />
          </button>

          {/* Right Button */}
          <button
            onTouchStart={(e) => handleTouchStart(e, 'right')}
            onTouchEnd={(e) => handleTouchEnd(e, 'right')}
            onTouchCancel={(e) => handleTouchEnd(e, 'right')}
            onMouseDown={() => onInputDown('right')}
            onMouseUp={() => onInputUp('right')}
            onMouseLeave={() => onInputUp('right')}
            aria-label="Move Right"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/70 text-slate-200 active:border-cyan-400 active:text-cyan-400 active:bg-cyan-950/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-2xl touch-none"
          >
            <ChevronRight className="w-8 h-8 pointer-events-none" />
          </button>
        </div>

        {/* Right Side: Action Cluster */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Secondary Actions Column: Dash & Shuriken */}
          <div className="flex flex-col gap-3">
            {/* Shuriken Button */}
            <button
              onTouchStart={(e) => handleTouchStart(e, 'shuriken')}
              onTouchEnd={(e) => handleTouchEnd(e, 'shuriken')}
              onTouchCancel={(e) => handleTouchEnd(e, 'shuriken')}
              onMouseDown={() => onInputDown('shuriken')}
              onMouseUp={() => onInputUp('shuriken')}
              onMouseLeave={() => onInputUp('shuriken')}
              aria-label="Throw Shuriken"
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/90 border border-amber-500/50 text-amber-400 active:border-amber-300 active:bg-amber-950/50 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-xl touch-none"
            >
              <Disc className="w-7 h-7 pointer-events-none animate-spin-slow" />
            </button>

            {/* Dash Button */}
            <button
              onTouchStart={(e) => handleTouchStart(e, 'dash')}
              onTouchEnd={(e) => handleTouchEnd(e, 'dash')}
              onTouchCancel={(e) => handleTouchEnd(e, 'dash')}
              onMouseDown={() => onInputDown('dash')}
              onMouseUp={() => onInputUp('dash')}
              onMouseLeave={() => onInputUp('dash')}
              aria-label="Shadow Dash"
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/90 border border-cyan-500/50 text-cyan-400 active:border-cyan-300 active:bg-cyan-950/50 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform shadow-xl touch-none"
            >
              <Zap className="w-7 h-7 pointer-events-none" />
            </button>
          </div>

          {/* Primary Actions: Katana Attack & Jump */}
          <div className="flex items-center gap-3">
            {/* Katana Attack (Large) */}
            <button
              onTouchStart={(e) => handleTouchStart(e, 'attack')}
              onTouchEnd={(e) => handleTouchEnd(e, 'attack')}
              onTouchCancel={(e) => handleTouchEnd(e, 'attack')}
              onMouseDown={() => onInputDown('attack')}
              onMouseUp={() => onInputUp('attack')}
              onMouseLeave={() => onInputUp('attack')}
              aria-label="Katana Slash"
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-rose-950/90 to-red-900/90 border-2 border-rose-500/80 text-rose-200 active:border-rose-400 active:scale-95 backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] touch-none cursor-pointer"
            >
              <Sword className="w-9 h-9 pointer-events-none text-rose-300" />
              <span className="text-[10px] font-bold tracking-widest text-rose-300/80 uppercase mt-0.5">
                Slash
              </span>
            </button>

            {/* Jump Button (Tall) */}
            <button
              onTouchStart={(e) => handleTouchStart(e, 'jump')}
              onTouchEnd={(e) => handleTouchEnd(e, 'jump')}
              onTouchCancel={(e) => handleTouchEnd(e, 'jump')}
              onMouseDown={() => onInputDown('jump')}
              onMouseUp={() => onInputUp('jump')}
              onMouseLeave={() => onInputUp('jump')}
              aria-label="Jump"
              className="w-16 h-18 sm:w-18 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-cyan-500/80 text-cyan-300 active:border-cyan-300 active:scale-95 backdrop-blur-md flex flex-col items-center justify-center transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] touch-none cursor-pointer"
            >
              <ArrowUp className="w-8 h-8 pointer-events-none" />
              <span className="text-[10px] font-bold tracking-widest text-cyan-300/80 uppercase mt-0.5">
                Jump
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
