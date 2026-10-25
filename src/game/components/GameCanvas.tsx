/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, ASPECT_RATIO } from '../constants';
import { gameViewport } from '../renderer/Viewport';
import { GameEngine } from '../engine/GameEngine';
import { InputState } from '../types';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine | null;
  inputState: InputState;
  onVirtualPointerDown?: (vx: number, vy: number) => void;
  onVirtualPointerMove?: (vx: number, vy: number) => void;
  onVirtualPointerUp?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  inputState,
  onVirtualPointerDown,
  onVirtualPointerMove,
  onVirtualPointerUp,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Resize handler to maintain exact 16:9 virtual aspect ratio
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    // Detect portrait orientation
    const portrait = containerHeight > containerWidth;
    setIsPortrait(portrait);

    // Update viewport math
    const metrics = gameViewport.update(containerWidth, containerHeight);

    // Apply physical resolution with Device Pixel Ratio for retina clarity
    canvas.width = metrics.physicalWidth;
    canvas.height = metrics.physicalHeight;

    // Apply CSS display size (letterboxed/pillarboxed inside container)
    canvas.style.width = `${metrics.displayWidth}px`;
    canvas.style.height = `${metrics.displayHeight}px`;

    // Apply scale to context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      gameViewport.applyTransform(ctx);
    }
  }, []);

  // Set up ResizeObserver and window events
  useEffect(() => {
    handleResize();

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;

    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(container);
    }

    const onWindowResize = () => handleResize();
    const onOrientationChange = () => {
      setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', onOrientationChange);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [handleResize]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let active = true;

    const loop = (currentTime: number) => {
      if (!active) return;

      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Cap dt to prevent physics explosions on frame stutter or tab switch
      const dt = Math.min(rawDt, 0.05);

      if (engine && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Reset transformation matrix and re-apply virtual scale
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          gameViewport.applyTransform(ctx);

          // Update game logic with delta-time and input
          engine.update(dt, inputState);

          // Render game frame
          engine.render(ctx);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [engine, inputState]);

  // Handle pointer / touch mapping into virtual coordinates
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onVirtualPointerDown) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = gameViewport.clientToVirtual(e.clientX, e.clientY, rect);
    onVirtualPointerDown(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onVirtualPointerMove) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = gameViewport.clientToVirtual(e.clientX, e.clientY, rect);
    onVirtualPointerMove(x, y);
  };

  const handlePointerUp = () => {
    if (onVirtualPointerUp) onVirtualPointerUp();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#030509] overflow-hidden select-none"
    >
      {/* HTML5 Canvas with strict aspect ratio and responsive DPR */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block touch-none shadow-2xl rounded-sm cursor-crosshair border border-slate-900/60"
        style={{
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 20px rgba(56, 189, 248, 0.05)',
        }}
      />

      {/* Mobile Portrait Hint Banner */}
      {isPortrait && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500/40 px-4 py-2 rounded-full text-xs text-cyan-300 flex items-center gap-2 shadow-lg backdrop-blur-sm pointer-events-none animate-pulse">
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>Rotate device horizontally for cinematic widescreen</span>
        </div>
      )}

      {/* Quick Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        aria-label="Toggle Fullscreen"
        className="absolute top-3 right-3 z-30 p-2 rounded-lg bg-black/40 hover:bg-black/70 text-slate-400 hover:text-white border border-slate-700/50 backdrop-blur-sm transition-colors cursor-pointer hidden md:flex items-center justify-center"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
