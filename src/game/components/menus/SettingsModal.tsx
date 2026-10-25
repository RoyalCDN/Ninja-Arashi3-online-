/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Sliders,
  Monitor,
  Smartphone,
  Keyboard,
} from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface SettingsModalProps {
  settings: UserProfile['settings'];
  onUpdateSettings: (newSettings: Partial<UserProfile['settings']>) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
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
          Game Settings
        </h2>

        <div className="w-16" />
      </div>

      {/* Settings Grid */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-4 z-10">
        {/* Audio Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-white">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <span>Audio Controls</span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                const nextMuted = !settings.muted;
                onUpdateSettings({ muted: nextMuted });
                soundManager.setVolumes(
                  settings.masterVolume,
                  settings.bgmVolume,
                  settings.sfxVolume,
                  nextMuted
                );
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                settings.muted
                  ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
              }`}
            >
              {settings.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{settings.muted ? 'Muted' : 'Audio Active'}</span>
            </button>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Master Volume</span>
              <span className="font-mono text-cyan-400">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ masterVolume: val });
                soundManager.setVolumes(val, settings.bgmVolume, settings.sfxVolume, settings.muted);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* BGM Volume */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Music & Ambience</span>
              <span className="font-mono text-cyan-400">{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.bgmVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ bgmVolume: val });
                soundManager.setVolumes(settings.masterVolume, val, settings.sfxVolume, settings.muted);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Sound Effects (Katana / Impacts)</span>
              <span className="font-mono text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ sfxVolume: val });
                soundManager.setVolumes(settings.masterVolume, settings.bgmVolume, val, settings.muted);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Graphics & Feedback */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-white">
            <Monitor className="w-5 h-5 text-rose-400" />
            <span>Display & Feedback</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Screen Shake */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Screen Shake</div>
                <div className="text-[10px] text-slate-400">Impact vibration</div>
              </div>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ screenShake: !settings.screenShake });
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  settings.screenShake ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.screenShake ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Quality */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Graphics</div>
                <div className="text-[10px] text-slate-400">Atmosphere quality</div>
              </div>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  const nextQ = settings.graphicsQuality === 'high' ? 'medium' : settings.graphicsQuality === 'medium' ? 'low' : 'high';
                  onUpdateSettings({ graphicsQuality: nextQ });
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700 capitalize cursor-pointer"
              >
                {settings.graphicsQuality}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Keyboard Controls Reference */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-white mb-3">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <span>Desktop Controls Reference</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Move Left / Right</span>
              <span className="font-mono font-bold text-amber-300">A / D or Arrow Keys</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Jump / Wall Jump</span>
              <span className="font-mono font-bold text-amber-300">Space or W or Up</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Katana Slash Combo</span>
              <span className="font-mono font-bold text-rose-400">J or Z or Left Click</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Shadow Dash</span>
              <span className="font-mono font-bold text-cyan-300">K or X</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Throw Shuriken</span>
              <span className="font-mono font-bold text-cyan-300">L or C</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Pause Menu</span>
              <span className="font-mono font-bold text-slate-300">Escape or P</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        Settings are automatically preserved on your local profile and synced to your cloud account.
      </div>
    </div>
  );
};
