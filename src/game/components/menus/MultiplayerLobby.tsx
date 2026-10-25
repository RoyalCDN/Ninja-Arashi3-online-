/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MultiplayerRoom, CharacterId, MapId, UserProfile } from '../../types';
import {
  ChevronLeft,
  Users,
  Plus,
  Key,
  Shield,
  Swords,
  CheckCircle2,
  Circle,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { soundManager } from '../../audio/SoundManager';

interface MultiplayerLobbyProps {
  userProfile: UserProfile;
  onStartMultiplayerMatch: (room: MultiplayerRoom) => void;
  onBack: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  userProfile,
  onStartMultiplayerMatch,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'join'>('browse');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [createdRoomName, setCreatedRoomName] = useState<string>(`${userProfile.username}'s Dojo`);
  const [createdMode, setCreatedMode] = useState<'COOP' | 'PVP'>('COOP');
  const [createdMap, setCreatedMap] = useState<MapId>('shadow_forest');

  // Interactive in-room state
  const [currentJoinedRoom, setCurrentJoinedRoom] = useState<MultiplayerRoom | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  // Simulated live lobby rooms for public multiplayer matching
  const [publicRooms, setPublicRooms] = useState<MultiplayerRoom[]>([
    {
      id: 'room_1',
      name: 'Forest Shadow Hunters',
      code: 'SHDW',
      hostName: 'Ren_Zephyr',
      isPrivate: false,
      mode: 'COOP',
      mapId: 'shadow_forest',
      maxPlayers: 4,
      players: [
        {
          id: 'p1',
          name: 'Ren_Zephyr',
          character: 'ren',
          isReady: true,
          isHost: true,
          health: 85,
          score: 1200,
          ping: 32,
        },
      ],
      status: 'WAITING',
      createdAt: Date.now() - 40000,
    },
    {
      id: 'room_2',
      name: 'Silent Cliffs 1v1 PvP',
      code: 'DUEL',
      hostName: 'Kuro_Blade',
      isPrivate: false,
      mode: 'PVP',
      mapId: 'silent_cliffs',
      maxPlayers: 2,
      players: [
        {
          id: 'p2',
          name: 'Kuro_Blade',
          character: 'kairo',
          isReady: true,
          isHost: true,
          health: 100,
          score: 2400,
          ping: 48,
        },
      ],
      status: 'WAITING',
      createdAt: Date.now() - 25000,
    },
    {
      id: 'room_3',
      name: 'Frozen Temple Glacial Raid',
      code: 'FROZ',
      hostName: 'FrostRonin',
      isPrivate: false,
      mode: 'COOP',
      mapId: 'frozen_temple',
      maxPlayers: 4,
      players: [
        {
          id: 'p3',
          name: 'FrostRonin',
          character: 'jin',
          isReady: true,
          isHost: true,
          health: 130,
          score: 1800,
          ping: 39,
        },
        {
          id: 'p4',
          name: 'ShadowFang',
          character: 'kairo',
          isReady: true,
          isHost: false,
          health: 100,
          score: 1550,
          ping: 55,
        },
      ],
      status: 'WAITING',
      createdAt: Date.now() - 15000,
    },
  ]);

  const handleCreateRoom = () => {
    soundManager.playButtonClick();
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newRoom: MultiplayerRoom = {
      id: `room_${Date.now()}`,
      name: createdRoomName || `${userProfile.username}'s Room`,
      code: newCode,
      hostName: userProfile.username,
      isPrivate: false,
      mode: createdMode,
      mapId: createdMap,
      maxPlayers: createdMode === 'PVP' ? 2 : 4,
      players: [
        {
          id: userProfile.id,
          name: userProfile.username,
          character: userProfile.selectedCharacter,
          isReady: true,
          isHost: true,
          health: 100,
          score: 0,
          ping: 28,
        },
      ],
      status: 'WAITING',
      createdAt: Date.now(),
    };

    setPublicRooms([newRoom, ...publicRooms]);
    setCurrentJoinedRoom(newRoom);
    setIsPlayerReady(true);
    soundManager.playCheckpoint();
  };

  const handleJoinByCode = () => {
    soundManager.playButtonClick();
    const code = roomCodeInput.trim().toUpperCase();
    const found = publicRooms.find((r) => r.code === code);
    if (found) {
      joinRoom(found);
    } else {
      // Create ad-hoc private room for this code
      const adhocRoom: MultiplayerRoom = {
        id: `room_code_${code}`,
        name: `Private Chamber ${code}`,
        code: code,
        hostName: 'Shinobi_Ally',
        isPrivate: true,
        mode: 'COOP',
        mapId: 'shadow_forest',
        maxPlayers: 4,
        players: [
          {
            id: 'ally_1',
            name: 'Shinobi_Ally',
            character: 'ren',
            isReady: true,
            isHost: true,
            health: 85,
            score: 0,
            ping: 35,
          },
        ],
        status: 'WAITING',
        createdAt: Date.now(),
      };
      joinRoom(adhocRoom);
    }
  };

  const joinRoom = (room: MultiplayerRoom) => {
    soundManager.playButtonClick();
    const updatedRoom: MultiplayerRoom = {
      ...room,
      players: [
        ...room.players,
        {
          id: userProfile.id,
          name: userProfile.username,
          character: userProfile.selectedCharacter,
          isReady: false,
          isHost: false,
          health: 100,
          score: 0,
          ping: 34,
        },
      ],
    };
    setCurrentJoinedRoom(updatedRoom);
    setIsPlayerReady(false);
  };

  const toggleReady = () => {
    soundManager.playButtonClick();
    setIsPlayerReady(!isPlayerReady);
    if (currentJoinedRoom) {
      const updatedPlayers = currentJoinedRoom.players.map((p) =>
        p.id === userProfile.id ? { ...p, isReady: !isPlayerReady } : p
      );
      setCurrentJoinedRoom({ ...currentJoinedRoom, players: updatedPlayers });
    }
  };

  const handleStartGame = () => {
    if (!currentJoinedRoom) return;
    soundManager.playCheckpoint();
    onStartMultiplayerMatch(currentJoinedRoom);
  };

  // If inside a room lobby, show room staging screen
  if (currentJoinedRoom) {
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-[#05070d] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setCurrentJoinedRoom(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Leave Room</span>
          </button>

          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white">
              {currentJoinedRoom.name}
            </h2>
            <div className="text-xs text-cyan-400 font-semibold flex items-center justify-center gap-2">
              <span>Code: <b className="font-mono text-amber-300 tracking-widest">{currentJoinedRoom.code}</b></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> 32ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-bold">
            {currentJoinedRoom.mode === 'COOP' ? (
              <span className="text-cyan-400 flex items-center gap-1"><Shield className="w-4 h-4" /> Co-Op</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1"><Swords className="w-4 h-4" /> PvP Duel</span>
            )}
          </div>
        </div>

        {/* Players in Room */}
        <div className="max-w-2xl mx-auto w-full my-auto py-6 z-10 space-y-3">
          <h3 className="text-xs font-cinzel uppercase tracking-widest text-slate-400 text-center mb-4">
            Connected Shinobi ({currentJoinedRoom.players.length}/{currentJoinedRoom.maxPlayers})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentJoinedRoom.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-rose-600 flex items-center justify-center font-bold text-white shadow-inner font-cinzel">
                    {p.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.isHost && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                          HOST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-400 capitalize">Hero: {p.character}</div>
                  </div>
                </div>

                <div>
                  {p.isReady ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Circle className="w-4 h-4 text-slate-500" /> Waiting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="max-w-md mx-auto w-full flex items-center gap-3 z-10">
          <button
            onClick={toggleReady}
            className={`flex-1 py-3.5 rounded-2xl font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isPlayerReady
                ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isPlayerReady ? 'I am Ready' : 'Toggle Ready'}</span>
          </button>

          <button
            onClick={handleStartGame}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-95 transition-all cursor-pointer border border-rose-400/50"
          >
            <Sparkles className="w-5 h-5" />
            <span>Launch Match</span>
          </button>
        </div>
      </div>
    );
  }

  // Lobby Browser Screen
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 bg-[#05070d] overflow-y-auto">
      {/* Top Header */}
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
          Multiplayer Dojo
        </h2>

        <div className="w-16" />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 max-w-md mx-auto w-full z-10 mt-2">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('browse');
          }}
          className={`flex-1 py-2 rounded-xl font-cinzel text-xs font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Browse Rooms
        </button>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('create');
          }}
          className={`flex-1 py-2 rounded-xl font-cinzel text-xs font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('join');
          }}
          className={`flex-1 py-2 rounded-xl font-cinzel text-xs font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'join'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Enter Code
        </button>
      </div>

      {/* Tab Contents */}
      <div className="my-auto py-6 max-w-2xl mx-auto w-full z-10">
        {activeTab === 'browse' && (
          <div className="space-y-3">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 backdrop-blur-md transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100">{room.name}</h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        room.mode === 'COOP'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {room.mode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Host: {room.hostName}</span>
                    <span>•</span>
                    <span className="font-mono text-amber-400">Code: {room.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-400">
                    <div className="font-bold text-slate-200">
                      {room.players.length}/{room.maxPlayers} Players
                    </div>
                    <div className="text-[10px] text-emerald-400">Low Latency</div>
                  </div>

                  <button
                    onClick={() => joinRoom(room)}
                    className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-cinzel font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Room Name
              </label>
              <input
                type="text"
                value={createdRoomName}
                onChange={(e) => setCreatedRoomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
                placeholder="Enter room title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-cinzel font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Game Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatedMode('COOP')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      createdMode === 'COOP'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Co-Op
                  </button>
                  <button
                    onClick={() => setCreatedMode('PVP')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      createdMode === 'PVP'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" /> PvP Duel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Battlefield
                </label>
                <select
                  value={createdMap}
                  onChange={(e) => setCreatedMap(e.target.value as MapId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="shadow_forest">Shadow Forest</option>
                  <option value="frozen_temple">Frozen Temple</option>
                  <option value="lava_valley">Lava Valley</option>
                  <option value="silent_cliffs">Silent Cliffs</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
            >
              <Plus className="w-5 h-5" />
              <span>Create & Host Room</span>
            </button>
          </div>
        )}

        {activeTab === 'join' && (
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl text-center space-y-4">
            <h3 className="text-sm font-cinzel font-bold text-white">
              Enter 4-Character Room Code
            </h3>
            <p className="text-xs text-slate-400">
              Input the private room code shared by your friend to join their session.
            </p>

            <input
              type="text"
              maxLength={4}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. SHDW"
              className="w-48 mx-auto text-center font-mono font-bold text-2xl tracking-[0.4em] bg-slate-950 border-2 border-cyan-500/50 rounded-2xl py-3 text-cyan-300 uppercase focus:outline-none focus:border-cyan-400"
            />

            <button
              onClick={handleJoinByCode}
              disabled={roomCodeInput.trim().length === 0}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Connect to Chamber</span>
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 z-10 flex items-center justify-center gap-2">
        <Users className="w-4 h-4" />
        <span>Synchronized character positions, attacks, and shared co-op boss raids.</span>
      </div>
    </div>
  );
};
