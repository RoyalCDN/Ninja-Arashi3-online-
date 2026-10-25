/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Users,
  Compass,
  User,
  Settings,
  Shield,
  ShoppingBag,
  Award,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { soundManager } from '../../audio/SoundManager';

interface MainMenuProps {
  userProfile: UserProfile;
  onNavigate: (screen: any) => void;
  onStartStory: () => void;
  onStartTraining: () => void;
  onLogout: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  userProfile,
  onNavigate,
  onStartStory,
  onStartTraining,
  onLogout,
}) => {
  const handleClick = (action: () => void) => {
    soundManager.playButtonClick();
    action();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-[#05070d] overflow-y-auto">
      {/* Background Japanese Calligraphy Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,#1e293b_0%,#05070d_70%)]" />

      {/* Top Bar: Profile Card & In-Game Currency */}
      <div className="relative z-10 w-full flex justify-between items-center">
        {/* Player Profile Pill */}
        <button
          onClick={() => handleClick(() => onNavigate('PROFILE'))}
          className="flex items-center gap-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 px-3 py-2 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-rose-600 flex items-center justify-center font-bold text-white shadow-inner font-cinzel">
            {userProfile.username.substring(0, 1).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <span>{userProfile.username}</span>
              {userProfile.isGuest && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Guest</span>
              )}
            </div>
            <div className="text-xs text-cyan-400">Level {userProfile.level} • {userProfile.xp} XP</div>
          </div>
        </button>

        {/* Currency & Quick Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Display */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/40 px-3.5 py-2 rounded-2xl text-amber-300 backdrop-blur-md shadow-md">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              🪙
            </div>
            <span className="font-bold text-sm font-rajdhani">{userProfile.coins}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => handleClick(() => onNavigate('SETTINGS'))}
            aria-label="Settings"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => handleClick(onLogout)}
            aria-label="Logout"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-red-950/60 border border-slate-700/60 hover:border-red-500/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer shadow-md"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Hero: Title & Dramatic Branding */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Online Dark Fantasy Action</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          NINJA AREAHI 3
        </h1>
        <div className="text-xl sm:text-2xl font-cinzel text-cyan-400 tracking-[0.3em] font-semibold mt-1 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
          ONLINE
        </div>

        <p className="max-w-md text-xs sm:text-sm text-slate-400 mt-3 font-rajdhani">
          Restore balance to the shattered realm of Akarai. Master the legendary katana of Kairo, conquer the 4 elemental temples, and duel warriors online.
        </p>

        {/* Big Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 w-full max-w-xl">
          {/* Play Story Mode */}
          <button
            onClick={() => handleClick(onStartStory)}
            className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-cinzel font-bold text-lg tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(225,29,72,0.4)] active:scale-95 transition-all cursor-pointer border border-rose-400/50"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Story Mode</span>
          </button>

          {/* Online Multiplayer */}
          <button
            onClick={() => handleClick(() => onNavigate('MULTIPLAYER_LOBBY'))}
            className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-cinzel font-bold text-lg tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(14,165,233,0.35)] active:scale-95 transition-all cursor-pointer border border-cyan-400/50"
          >
            <Users className="w-6 h-6" />
            <span>Online Lobby</span>
          </button>
        </div>
      </div>

      {/* Bottom Sub-Menus Grid */}
      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Character Select */}
        <button
          onClick={() => handleClick(() => onNavigate('CHARACTER_SELECT'))}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-lg backdrop-blur-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-600/40 flex items-center justify-center text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Ninja Roster</div>
            <div className="text-[10px] text-slate-400">Select Hero</div>
          </div>
        </button>

        {/* Map Selection */}
        <button
          onClick={() => handleClick(() => onNavigate('STORY_LEVELS'))}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-lg backdrop-blur-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Map Select</div>
            <div className="text-[10px] text-slate-400">4 Temples</div>
          </div>
        </button>

        {/* Inventory & Skills */}
        <button
          onClick={() => handleClick(() => onNavigate('INVENTORY'))}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-lg backdrop-blur-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Upgrades</div>
            <div className="text-[10px] text-slate-400">Weapons & Gear</div>
          </div>
        </button>

        {/* Training Dojo */}
        <button
          onClick={() => handleClick(onStartTraining)}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-lg backdrop-blur-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-600/40 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Training Dojo</div>
            <div className="text-[10px] text-slate-400">Practice Combos</div>
          </div>
        </button>
      </div>
    </div>
  );
};
