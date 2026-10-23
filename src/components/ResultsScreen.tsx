import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ConfirmModal } from './ConfirmModal';
import { Trophy, RefreshCw, RotateCcw, Crown, Swords, Users, User, Star } from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Rank Medal helpers
// ─────────────────────────────────────────────────────────
const RANK_MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];
const RANK_RING = [
  'ring-2 ring-amber-400 shadow-lg shadow-amber-900/50',  // 1st
  'ring-2 ring-slate-400 shadow-md shadow-slate-900/40',  // 2nd
  'ring-1 ring-amber-700/70',                              // 3rd
  '',                                                      // 4th
];
const RANK_BG = [
  'bg-gradient-to-br from-amber-950/80 to-yellow-900/40 border-amber-600/50',
  'bg-gradient-to-br from-slate-800/70 to-slate-900/50 border-slate-600/40',
  'bg-gradient-to-br from-amber-950/40 to-slate-900/60 border-amber-800/30',
  'bg-slate-900/40 border-slate-800/50',
];

const fmtScore = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const ResultsScreen: React.FC = () => {
  const {
    mode,
    players,
    rounds,
    resetGame,
    newGameSamePlayers,
    getPlayerTotals,
    getTeamTotals,
  } = useGameStore();

  const [
    showResetConfirm,
    setShowResetConfirm,
  ] = useState(false);

  const playerTotals = getPlayerTotals();
  const teamResult = mode === 'teams' ? getTeamTotals() : null;

  const winner = playerTotals[0];
  const isTie = playerTotals.length > 1 && playerTotals[0].total === playerTotals[1].total;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center pt-10 pb-6 px-5 text-center gap-3">
          <div className="flex gap-2 text-2xl select-none">
            <span>♠</span><span className="text-red-500">♥</span><span>♣</span><span className="text-red-500">♦</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">
            Final Results
          </h1>
          <p className="text-sm text-slate-400">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''} completed
          </p>
        </div>
      </div>

      {/* ─── Teams Mode: Team Winner Announcement ─── */}
      {mode === 'teams' && teamResult && (
        <div className="px-4 mb-5">
          <div
            className={`relative overflow-hidden rounded-3xl p-5 border text-center shadow-2xl ${
              teamResult.winningTeam === 'A'
                ? 'bg-gradient-to-b from-emerald-950/80 to-emerald-900/30 border-emerald-500/50 shadow-emerald-950/50'
                : teamResult.winningTeam === 'B'
                  ? 'bg-gradient-to-b from-purple-950/80 to-purple-900/30 border-purple-500/50 shadow-purple-950/50'
                  : 'bg-gradient-to-b from-slate-800/80 to-slate-900/40 border-slate-600/50'
            }`}
          >
            {/* Glow accent */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-30 pointer-events-none ${
                teamResult.winningTeam === 'A'
                  ? 'bg-emerald-400'
                  : teamResult.winningTeam === 'B'
                    ? 'bg-purple-400'
                    : 'bg-slate-500'
              }`}
            />

            <div className="relative z-10 flex flex-col items-center gap-3">
              {teamResult.winningTeam === 'tie' ? (
                <>
                  <span className="text-4xl">🤝</span>
                  <h2 className="text-xl font-black text-slate-200">It's a Tie!</h2>
                  <p className="text-sm text-slate-400">Both teams finished equal</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Crown className="w-7 h-7 text-amber-400 fill-amber-400/30" />
                    <span className="text-3xl font-black text-white tracking-tight">
                      Team {teamResult.winningTeam} Wins!
                    </span>
                    <Crown className="w-7 h-7 text-amber-400 fill-amber-400/30" />
                  </div>
                  <div className="flex items-center gap-2">
                    {teamResult.winningTeam === 'A' ? (
                      <>
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-300">فريق أ</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-300">فريق ب</span>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Team Scores Grid */}
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                {/* Team A */}
                <div
                  className={`rounded-2xl p-3 border flex flex-col items-center gap-1.5 transition-all ${
                    teamResult.winningTeam === 'A'
                      ? 'bg-emerald-900/60 border-emerald-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-700/50 opacity-70'
                  }`}
                >
                  {teamResult.winningTeam === 'A' && (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Team A (فريق أ)</span>
                  <span className="text-2xl font-black text-emerald-200 tabular-nums">
                    {fmtScore(teamResult.teamA.total)}
                  </span>
                  <div className="text-[11px] text-emerald-400/80 text-center leading-tight">
                    {teamResult.teamA.players.map((p) => p.name).join(' & ')}
                  </div>
                </div>

                {/* Team B */}
                <div
                  className={`rounded-2xl p-3 border flex flex-col items-center gap-1.5 transition-all ${
                    teamResult.winningTeam === 'B'
                      ? 'bg-purple-900/60 border-purple-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-700/50 opacity-70'
                  }`}
                >
                  {teamResult.winningTeam === 'B' && (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Team B (فريق ب)</span>
                  <span className="text-2xl font-black text-purple-200 tabular-nums">
                    {fmtScore(teamResult.teamB.total)}
                  </span>
                  <div className="text-[11px] text-purple-400/80 text-center leading-tight">
                    {teamResult.teamB.players.map((p) => p.name).join(' & ')}
                  </div>
                </div>
              </div>

              {teamResult.winningTeam !== 'tie' && (
                <p className="text-xs text-slate-400">
                  Winning margin:{' '}
                  <span className="font-bold text-amber-400">{teamResult.difference} pts</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Solo Mode: Winner Call-out ─── */}
      {mode === 'solo' && winner && (
        <div className="px-4 mb-5">
          <div className="relative overflow-hidden rounded-3xl p-5 border bg-gradient-to-b from-amber-950/60 to-slate-900/40 border-amber-500/40 text-center shadow-xl shadow-amber-950/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-4xl">{isTie ? '🤝' : '🏆'}</span>
              <div className="flex items-center gap-2">
                {!isTie && <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30" />}
                <h2 className="text-xl font-black text-amber-300">
                  {isTie ? "It's a Tie!" : `${winner.player.name} Wins!`}
                </h2>
                {!isTie && <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30" />}
              </div>
              {!isTie && (
                <span className="text-2xl font-black tabular-nums text-white">
                  {fmtScore(winner.total)}
                  <span className="text-sm font-normal text-slate-400 ml-1">pts</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Individual Rankings ─── */}
      <div className="px-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {mode === 'teams' ? 'Individual Scores' : 'Player Rankings'}
          </h3>
          {mode === 'solo' && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <User className="w-3 h-3" />
              <span>Highest → Lowest</span>
            </div>
          )}
          {mode === 'teams' && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Swords className="w-3 h-3" />
              <span>by team</span>
            </div>
          )}
        </div>

        {playerTotals.map((pt, idx) => {
          const isTeamA = pt.player.team === 'A';
          const rankIdx = Math.min(idx, 3);

          return (
            <div
              key={pt.player.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${RANK_BG[rankIdx]} ${RANK_RING[rankIdx]}`}
            >
              {/* Medal / Rank */}
              <div className="text-2xl shrink-0 w-9 text-center select-none">
                {RANK_MEDALS[rankIdx]}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-black text-slate-100 text-base truncate">
                    {pt.player.name}
                  </span>
                  {idx === 0 && !isTie && mode === 'solo' && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {mode === 'teams' && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                        isTeamA
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      Team {pt.player.team}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    {rounds.length} round{rounds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right shrink-0">
                <span
                  className={`text-2xl font-black tabular-nums leading-none ${
                    pt.total > 0
                      ? 'text-emerald-400'
                      : pt.total < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                  }`}
                >
                  {fmtScore(pt.total)}
                </span>
                {mode === 'solo' && (
                  <span className="block text-[10px] font-bold text-slate-500 mt-0.5">
                    Rank #{pt.rank}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Round Summary ─── */}
      {rounds.length > 0 && (
        <div className="px-4 mt-5">
          <details className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <summary className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer flex items-center justify-between">
              <span>Round-by-Round Breakdown</span>
              <span className="text-slate-500 text-[11px] normal-case">{rounds.length} rounds</span>
            </summary>
            <div className="border-t border-slate-800">
              {/* Header */}
              <div className="grid px-4 py-2 border-b border-slate-800/60"
                style={{ gridTemplateColumns: '1.5rem 1fr 1fr 1fr 1fr' }}>
                <span className="text-[10px] font-bold text-slate-600">#</span>
                {players.map((p) => (
                  <span key={p.id} className="text-[10px] font-bold text-slate-500 truncate text-center">
                    {p.name.split(' ')[0]}
                  </span>
                ))}
              </div>
              {rounds.map((round, rIdx) => (
                <div
                  key={round.id}
                  className="grid px-4 py-2 border-b border-slate-800/30 last:border-0"
                  style={{ gridTemplateColumns: '1.5rem 1fr 1fr 1fr 1fr' }}
                >
                  <span className="text-[11px] font-bold text-slate-600">{rIdx + 1}</span>
                  {players.map((p) => {
                    const s = round.scores[p.id] ?? 0;
                    return (
                      <span
                        key={p.id}
                        className={`text-[12px] font-semibold tabular-nums text-center ${
                          s > 0 ? 'text-emerald-400' : s < 0 ? 'text-rose-400' : 'text-slate-600'
                        }`}
                      >
                        {fmtScore(s)}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        <button
          type="button"
          id="play-again-btn"
          onClick={newGameSamePlayers}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 text-white font-black text-base uppercase tracking-wide shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[56px]"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again • Same Players
        </button>
        <button
          type="button"
          id="new-game-btn"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 font-bold text-sm uppercase tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 min-h-[50px]"
        >
          <RotateCcw className="w-4 h-4" />
          New Game • Change Players
        </button>
      </div>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <ConfirmModal
          emoji="🔄"
          title="Start a New Game?"
          description="All scores will be cleared and you'll return to the Setup Screen to configure new players. This cannot be undone."
          confirmLabel="Yes, New Game"
          onConfirm={() => { resetGame(); setShowResetConfirm(false); }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
};
