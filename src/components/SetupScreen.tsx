import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { GameMode } from '../types/game';
import { Users, User, Play, Shuffle, RotateCcw, Swords, ArrowRight } from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const { players, mode, rounds, startGame, resetGame, setStatus } = useGameStore();

  const [selectedMode, setSelectedMode] = useState<GameMode>(mode || 'solo');
  const [names, setNames] = useState<[string, string, string, string]>([
    players[0]?.name || 'Player 1',
    players[1]?.name || 'Player 2',
    players[2]?.name || 'Player 3',
    players[3]?.name || 'Player 4',
  ]);
  const [showTableDiagram, setShowTableDiagram] = useState<boolean>(true);

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names] as [string, string, string, string];
    updated[index] = value;
    setNames(updated);
  };

  const handleShuffleSeats = () => {
    // Shuffle the 4 players' seating arrangement
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setNames(shuffled as [string, string, string, string]);
  };

  const handleResetDefaults = () => {
    setNames(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNames = names.map((n, i) => (n.trim().length > 0 ? n.trim() : `Player ${i + 1}`));
    startGame(cleanedNames, selectedMode);
  };

  const hasActiveGame = rounds.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-8 selection:bg-emerald-500 selection:text-white">
      {/* Top Card Motif & Header */}
      <header className="pt-6 pb-4 px-4 text-center border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-red-500 text-lg">♥</span>
          <span className="text-slate-300 text-lg">♠</span>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase">
            Trix & Tarneeb
          </h1>
          <span className="text-red-500 text-lg">♦</span>
          <span className="text-slate-300 text-lg">♣</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">حاسبة نقاط الورق • Game Setup</p>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">
        {/* Active game banner if previously in progress */}
        {hasActiveGame && (
          <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-950/20 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Saved Session Found
              </span>
              <span className="text-sm text-amber-100/90 font-medium mt-0.5">
                {rounds.length} round{rounds.length > 1 ? 's' : ''} in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('playing')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                Resume
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetGame}
                title="Discard saved session"
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl transition-colors text-xs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Game Mode Selector */}
        <section className="flex flex-col gap-2.5">
          <label className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>1. Select Game Mode</span>
            <span className="text-slate-500 text-[11px] normal-case">اختر نوع اللعب</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Solo Mode Button */}
            <button
              type="button"
              onClick={() => setSelectedMode('solo')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.98] min-h-[115px] ${
                selectedMode === 'solo'
                  ? 'bg-slate-850/90 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-750 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    selectedMode === 'solo'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                {selectedMode === 'solo' && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-1.5">
                  Solo Mode
                  <span className="text-xs font-normal text-slate-400">(فردي)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  Every player for themselves
                </p>
              </div>
            </button>

            {/* Teams Mode Button */}
            <button
              type="button"
              onClick={() => setSelectedMode('teams')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.98] min-h-[115px] ${
                selectedMode === 'teams'
                  ? 'bg-slate-850/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-750 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    selectedMode === 'teams'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                {selectedMode === 'teams' && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-1.5">
                  Teams Mode
                  <span className="text-xs font-normal text-slate-400">(شراكة)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  Team A (1 & 3) vs Team B (2 & 4)
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Player Names Input Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              2. Players & Seating (4 Players)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffleSeats}
                className="text-xs font-medium text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors"
                title="Shuffle player positions"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Shuffle
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                Default
              </button>
            </div>
          </div>

          {/* Teams Clarification Banner if in Teams mode */}
          {selectedMode === 'teams' && (
            <div className="bg-slate-900/80 border border-cyan-800/50 rounded-2xl p-3.5 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" />
                  Partnership Rules
                </span>
                <button
                  type="button"
                  onClick={() => setShowTableDiagram(!showTableDiagram)}
                  className="text-cyan-400 hover:underline text-[11px] font-semibold"
                >
                  {showTableDiagram ? 'Hide Seating' : 'Show Seating'}
                </button>
              </div>

              {/* Seating Table Diagram */}
              {showTableDiagram && (
                <div className="relative w-full h-36 bg-slate-950/70 border border-slate-800 rounded-xl my-1 flex items-center justify-center p-2">
                  {/* Card Table Surface */}
                  <div className="w-36 h-20 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Table</span>
                    <span className="text-[10px] text-emerald-500/70">طاولة اللعب</span>
                  </div>

                  {/* Player 1 (North) - Team A */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-900/60 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-200 shadow-sm max-w-[140px] truncate">
                    <span className="text-[10px] bg-emerald-500 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                      1
                    </span>
                    <span className="truncate">{names[0] || 'P1'} (Team A)</span>
                  </div>

                  {/* Player 3 (South) - Team A */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-900/60 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-200 shadow-sm max-w-[140px] truncate">
                    <span className="text-[10px] bg-emerald-500 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                      3
                    </span>
                    <span className="truncate">{names[2] || 'P3'} (Team A)</span>
                  </div>

                  {/* Player 4 (West) - Team B */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-purple-900/60 border border-purple-500/50 px-2 py-0.5 rounded-full text-xs font-semibold text-purple-200 shadow-sm max-w-[95px] truncate">
                    <span className="text-[10px] bg-purple-400 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                      4
                    </span>
                    <span className="truncate">{names[3] || 'P4'}</span>
                  </div>

                  {/* Player 2 (East) - Team B */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-purple-900/60 border border-purple-500/50 px-2 py-0.5 rounded-full text-xs font-semibold text-purple-200 shadow-sm max-w-[95px] truncate">
                    <span className="text-[10px] bg-purple-400 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                      2
                    </span>
                    <span className="truncate">{names[1] || 'P2'}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-600/40 text-emerald-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <div className="truncate">
                    <strong className="block text-emerald-300">Team A (فريق أ)</strong>
                    <span className="text-[11px] text-emerald-200/80">Players 1 & 3</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-600/40 text-purple-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>
                  <div className="truncate">
                    <strong className="block text-purple-300">Team B (فريق ب)</strong>
                    <span className="text-[11px] text-purple-200/80">Players 2 & 4</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Player Name Inputs */}
          <div className="flex flex-col gap-3">
            {names.map((name, index) => {
              const isTeamA = index === 0 || index === 2;
              const teamLabel = isTeamA ? 'Team A' : 'Team B';
              const teamBadgeColor = isTeamA
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30';

              const playerNumber = index + 1;

              return (
                <div
                  key={`player-${index}`}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 transition-colors focus-within:border-slate-600 focus-within:bg-slate-900"
                >
                  {/* Player Number / Team Indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-slate-800 border border-slate-750 text-slate-300">
                    <span className="text-xs font-bold text-slate-400">P{playerNumber}</span>
                    {selectedMode === 'teams' ? (
                      <span className={`text-[9px] font-black uppercase ${isTeamA ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {isTeamA ? 'TM A' : 'TM B'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 uppercase">Solo</span>
                    )}
                  </div>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <label
                      htmlFor={`player-input-${index}`}
                      className="block text-[11px] font-semibold text-slate-400 mb-0.5"
                    >
                      Player {playerNumber} Name
                    </label>
                    <input
                      id={`player-input-${index}`}
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Player ${playerNumber}`}
                      maxLength={24}
                      className="w-full bg-slate-950/80 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all min-h-[46px]"
                    />
                  </div>

                  {/* Team Tag */}
                  {selectedMode === 'teams' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${teamBadgeColor}`}
                    >
                      {teamLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Start Game Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:from-emerald-600 active:to-teal-700 text-slate-950 font-black text-lg tracking-wide uppercase shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 min-h-[56px]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Game • ابدأ اللعبة</span>
          </button>

          <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
            Scores are saved automatically to your browser (localStorage).
          </p>
        </div>
      </main>
    </div>
  );
};
