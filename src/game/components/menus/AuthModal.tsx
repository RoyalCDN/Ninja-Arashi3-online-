/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Shield, User, Mail, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface AuthModalProps {
  onAuthSuccess: (profile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    // Check stored user accounts in localStorage
    try {
      const storedUsersRaw = localStorage.getItem('ninja_areahi_accounts');
      const accounts = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const found = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        setErrorMessage('No shinobi account registered with this email.');
        return;
      }

      // Check simple hash match
      if (found.passwordHash !== btoa(password)) {
        setErrorMessage('Incorrect password for this account.');
        return;
      }

      soundManager.playCheckpoint();
      setSuccessMessage('Welcome back, Shinobi!');
      setTimeout(() => {
        onAuthSuccess(found.profile);
      }, 400);
    } catch {
      setErrorMessage('Failed to sign in. Please try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || username.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const storedUsersRaw = localStorage.getItem('ninja_areahi_accounts');
      const accounts = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      // Check duplicate email or username
      if (accounts.some((a: any) => a.email.toLowerCase() === email.toLowerCase())) {
        setErrorMessage('This email is already registered. Please log in.');
        return;
      }
      if (accounts.some((a: any) => a.username.toLowerCase() === username.toLowerCase())) {
        setErrorMessage('This username is already claimed by another warrior.');
        return;
      }

      const newProfile: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: username.trim(),
        email: email.trim(),
        avatar: 'kairo',
        isGuest: false,
        coins: 100, // Starter bonus
        level: 1,
        xp: 0,
        selectedCharacter: 'kairo',
        unlockedCharacters: ['kairo', 'ren'],
        unlockedMaps: ['shadow_forest', 'frozen_temple', 'lava_valley', 'silent_cliffs'],
        stats: {
          enemiesKilled: 0,
          bossesSlain: 0,
          deaths: 0,
          coinsCollected: 100,
          missionsCompleted: 0,
        },
        upgrades: {
          healthTier: 0,
          attackTier: 0,
          dashTier: 0,
          shurikenTier: 0,
        },
        settings: {
          masterVolume: 0.8,
          bgmVolume: 0.55,
          sfxVolume: 0.75,
          muted: false,
          screenShake: true,
          graphicsQuality: 'high',
          touchSize: 1.0,
        },
      };

      accounts.push({
        email: email.trim(),
        username: username.trim(),
        passwordHash: btoa(password),
        profile: newProfile,
      });

      localStorage.setItem('ninja_areahi_accounts', JSON.stringify(accounts));
      soundManager.playCheckpoint();
      setSuccessMessage('Account established! Entering the realm...');

      setTimeout(() => {
        onAuthSuccess(newProfile);
      }, 500);
    } catch {
      setErrorMessage('Could not complete registration.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your account email.');
      return;
    }
    setSuccessMessage('Password recovery instructions dispatched to your email.');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#05070d] overflow-y-auto select-none">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,#1e293b_0%,#05070d_80%)]" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border-2 border-slate-700/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center space-y-4">
        {/* Emblem */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-rose-600 p-0.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-rose-400">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-cinzel font-black tracking-wider text-slate-100">
            NINJA AREAHI 3
          </h2>
          <div className="text-xs text-cyan-400 tracking-[0.3em] font-bold uppercase mt-0.5">
            Shinobi Sanctuary
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/60 p-2.5 rounded-xl text-xs text-rose-300 font-semibold animate-shake">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-2.5 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 justify-center">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`text-xs font-cinzel font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Warrior Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`text-xs font-cinzel font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Forms */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@akarai.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-rajdhani"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-rajdhani"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 border border-cyan-400/40"
            >
              <span>Authenticate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Shinobi Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kairo_Shadow"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-rajdhani"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@akarai.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-rajdhani"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-rajdhani"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-rajdhani"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 border border-rose-400/40"
            >
              <span>Create Shinobi Account</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-cinzel font-bold text-slate-300 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="warrior@akarai.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs text-slate-400 hover:underline cursor-pointer block"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* Guest Mode Divider */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onContinueAsGuest();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider border border-slate-800 cursor-pointer transition-colors"
          >
            Enter as Wandering Guest
          </button>
        </div>
      </div>
    </div>
  );
};
