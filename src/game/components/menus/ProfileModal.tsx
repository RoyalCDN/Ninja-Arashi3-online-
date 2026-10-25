/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import { ChevronLeft, Award, Skull, Coins, Zap, Trophy, Shield } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface ProfileModalProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, onBack }) => {
  const achievements = [
    { id: 'a1', title: 'Way of the Ronin', desc: 'Conquer the Shadow Forest', unlocked: true },
    { id: 'a2', title: 'Frostbound Master', desc: 'Overcome the Frozen Temple', unlocked: true },
    { id: 'a3', title: 'Infernal Strider', desc: 'Survive the molten crags of Lava Valley', unlocked: false },
    { id: 'a4', title: 'Bane of Akuma', desc: 'Defeat Akuma the Shadow Overlord', unlocked: false },
    { id: 'a5', title: 'Master of Coin', desc: 'Accumulate over 500 golden shurikens', unlocked: userProfile.coins >= 500 },
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
          Player Profile
        </h2>

        <div className="w-16" />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-4 z-10">
        {/* Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-rose-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg font-cinzel shrink-0">
            {userProfile.username.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-cinzel text-white">{userProfile.username}</h3>
              {userProfile.isGuest ? (
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  Guest
                </span>
              ) : (
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-mono">
                  Verified
                </span>
              )}
            </div>
            <div className="text-xs text-cyan-400 font-semibold mt-0.5">
              Player Level {userProfile.level} • {userProfile.xp} / {userProfile.level * 150} XP
            </div>
            {/* XP progress bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (userProfile.xp / (userProfile.level * 150)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Skull className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Foes Defeated</div>
            <div className="text-lg font-bold text-white font-rajdhani">
              {userProfile.stats.enemiesKilled}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Bosses Slain</div>
            <div className="text-lg font-bold text-white font-rajdhani">
              {userProfile.stats.bossesSlain}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Coins className="w-5 h-5 text-amber-300 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Gold Collected</div>
            <div className="text-lg font-bold text-white font-rajdhani">
              {userProfile.stats.coinsCollected}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Missions Done</div>
            <div className="text-lg font-bold text-white font-rajdhani">
              {userProfile.stats.missionsCompleted}
            </div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl space-y-3">
          <div className="text-xs font-cinzel font-bold text-slate-300 uppercase tracking-wider mb-2">
            Shinobi Achievements
          </div>
          <div className="space-y-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  a.unlocked
                    ? 'bg-slate-950/80 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="text-xs font-bold font-cinzel flex items-center gap-1.5">
                    <span>{a.title}</span>
                    {a.unlocked && <span className="text-[10px] text-amber-400">★ Unlocked</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">{a.desc}</div>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    a.unlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {a.unlocked ? '✓' : '🔒'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        Account ID: <span className="font-mono text-slate-400">{userProfile.id}</span>
      </div>
    </div>
  );
};
