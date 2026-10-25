/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../../types';
import { ChevronLeft, Sword, Heart, Disc, Zap, ShoppingBag } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface InventoryModalProps {
  userProfile: UserProfile;
  onUpgradeTier: (upgradeKey: keyof UserProfile['upgrades'], cost: number) => void;
  onBack: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  userProfile,
  onUpgradeTier,
  onBack,
}) => {
  const upgradeItems = [
    {
      key: 'attackTier' as const,
      name: 'Katana Edge Honing',
      desc: 'Hone the folded steel of your blade for increased base slash damage.',
      icon: <Sword className="w-5 h-5 text-rose-400" />,
      currentTier: userProfile.upgrades.attackTier,
      maxTier: 5,
      cost: (userProfile.upgrades.attackTier + 1) * 80,
      benefit: `+${(userProfile.upgrades.attackTier + 1) * 6} ATK Power`,
    },
    {
      key: 'healthTier' as const,
      name: 'Vitality Elixir Flask',
      desc: 'Ancient herbal concoctions that fortify maximum health points.',
      icon: <Heart className="w-5 h-5 text-emerald-400" />,
      currentTier: userProfile.upgrades.healthTier,
      maxTier: 5,
      cost: (userProfile.upgrades.healthTier + 1) * 75,
      benefit: `+${(userProfile.upgrades.healthTier + 1) * 20} Max HP`,
    },
    {
      key: 'shurikenTier' as const,
      name: 'Expanded Ninja Pouch',
      desc: 'Reinforced waist pouch carrying additional throwing stars.',
      icon: <Disc className="w-5 h-5 text-amber-400" />,
      currentTier: userProfile.upgrades.shurikenTier,
      maxTier: 5,
      cost: (userProfile.upgrades.shurikenTier + 1) * 60,
      benefit: `+${(userProfile.upgrades.shurikenTier + 1) * 2} Shuriken Capacity`,
    },
    {
      key: 'dashTier' as const,
      name: 'Shadow Step Boots',
      desc: 'Lightweight enchanted boots that accelerate shadow dash cooldown.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      currentTier: userProfile.upgrades.dashTier,
      maxTier: 5,
      cost: (userProfile.upgrades.dashTier + 1) * 90,
      benefit: '-15% Dash Cooldown',
    },
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
          Armory Upgrades
        </h2>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-bold">
          🪙 {userProfile.coins}
        </div>
      </div>

      {/* Upgrades Grid */}
      <div className="max-w-3xl mx-auto w-full my-auto py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 z-10">
        {upgradeItems.map((item) => {
          const isMax = item.currentTier >= item.maxTier;
          const canAfford = userProfile.coins >= item.cost;

          return (
            <div
              key={item.key}
              className="bg-slate-900/90 border border-slate-800 p-4.5 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-cinzel font-bold text-white">{item.name}</h3>
                      <div className="text-[11px] text-cyan-400 font-bold">
                        Tier {item.currentTier}/{item.maxTier}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
                    {item.benefit}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 font-rajdhani">{item.desc}</p>
              </div>

              {isMax ? (
                <div className="w-full py-2.5 rounded-xl bg-slate-950 text-slate-500 text-xs font-bold text-center font-cinzel uppercase tracking-wider border border-slate-800">
                  Mastered (Max Tier)
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (canAfford) {
                      soundManager.playCheckpoint();
                      onUpgradeTier(item.key, item.cost);
                    } else {
                      soundManager.playHurt();
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg active:scale-95'
                      : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Upgrade ({item.cost} Coins)</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        All upgrades permanently enhance your ninja across story, training, and multiplayer sessions.
      </div>
    </div>
  );
};
