import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, sanitizeScore } from '../store/useGameStore';
import { ConfirmModal } from './ConfirmModal';
import { useWakeLock } from '../hooks/useWakeLock';
import {
  PlusCircle,
  Trash2,
  Flag,
  RotateCcw,
  Edit3,
  SaveAll,
  Pencil,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const fmtScore = (n: number) => (n > 0 ? `+${n}` : `${n}`);

type DraftMap = Record<string, string>;

const buildEmptyDraft = (playerIds: string[]): DraftMap =>
  Object.fromEntries(playerIds.map((id) => [id, '']));

const buildDraftFromScores = (
  playerIds: string[],
  scores: Record<string, number>,
): DraftMap =>
  Object.fromEntries(playerIds.map((id) => [id, String(scores[id] ?? 0)]));

// ─────────────────────────────────────────────────────────
// Inline editable score cell (tap a saved cell to edit it)
// ─────────────────────────────────────────────────────────
interface EditableCellProps {
  value: number;
  onSave: (val: number) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    setRaw(String(value));
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 40);
  };

  const commit = useCallback(() => {
    onSave(sanitizeScore(raw));
    setEditing(false);
  }, [raw, onSave]);

  const cancel = () => setEditing(false);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        pattern="-?[0-9]*"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full bg-slate-800 border border-emerald-500 rounded-lg px-1 py-1.5 text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular-nums"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={openEdit}
      className={`w-full py-2 px-0.5 rounded-lg text-sm font-semibold tabular-nums text-center transition-colors hover:bg-slate-800/60 active:scale-95 ${value > 0
        ? 'text-emerald-400'
        : value < 0
          ? 'text-rose-400'
          : 'text-slate-500'
        }`}
      title="Tap to edit score"
    >
      {fmtScore(value)}
    </button>
  );
};

// ─────────────────────────────────────────────────────────
// Scoreboard Screen
// ─────────────────────────────────────────────────────────
export const ScoreboardScreen: React.FC = () => {
  const {
    players,
    mode,
    rounds,
    addRound,
    updateRoundScore,
    deleteRound,
    endGame,
    resetGame,
    getPlayerTotals,
  } = useGameStore();

  const playerIds = players.map((p) => p.id);

  // ── State ──────────────────────────────────────────────
  /** null = new round mode; string = round ID being edited */
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftMap>(() => buildEmptyDraft(playerIds));
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  // ── Wake Lock: keep screen on while scoreboard is active ──
  useWakeLock(true);

  // ── Derived ─────────────────────────────────────────────
  const playerTotals = getPlayerTotals();
  const totalFor = (pid: string) =>
    playerTotals.find((pt) => pt.player.id === pid)?.total ?? 0;

  // ── Scroll to bottom when a new round is saved ──────────
  useEffect(() => {
    if (rounds.length > 0 && editingRoundId === null) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [rounds.length, editingRoundId]);

  // ── Draft handlers ──────────────────────────────────────
  const handleDraftChange = (pid: string, raw: string) => {
    setDraft((prev) => ({ ...prev, [pid]: raw }));
  };

  /** Load an existing round into the input row for editing */
  const handleEditRound = (roundId: string) => {
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;
    setEditingRoundId(roundId);
    setDraft(buildDraftFromScores(playerIds, round.scores));
    // Scroll input row into view
    setTimeout(() => {
      inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      inputRefs.current[playerIds[0]]?.focus();
    }, 80);
  };

  /** Cancel editing mode and go back to new-round mode */
  const handleCancelEdit = () => {
    setEditingRoundId(null);
    setDraft(buildEmptyDraft(playerIds));
  };

  const handleSaveRound = useCallback(() => {
    const scores: Record<string, number> = {};
    for (const p of players) {
      scores[p.id] = sanitizeScore(draft[p.id]);
    }

    if (editingRoundId) {
      // Update every player's score in the existing round
      for (const p of players) {
        updateRoundScore(editingRoundId, p.id, scores[p.id]);
      }
      setEditingRoundId(null);
    } else {
      addRound(scores);
    }

    setDraft(buildEmptyDraft(playerIds));

    // Re-focus first input
    const firstId = playerIds[0];
    if (firstId) setTimeout(() => inputRefs.current[firstId]?.focus(), 80);
  }, [draft, players, playerIds, editingRoundId, addRound, updateRoundScore]);

  const handleInputKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      if (idx < players.length - 1) {
        inputRefs.current[playerIds[idx + 1]]?.focus();
      } else {
        handleSaveRound();
      }
    }
    if (e.key === 'Escape' && editingRoundId) {
      handleCancelEdit();
    }
  };

  // ── Column sizes ─────────────────────────────────────────
  const COL = 'flex-1 min-w-0';
  const COL_SIDE = 'w-10 shrink-0';

  // ── Label for the input row ──────────────────────────────
  const isEditing = editingRoundId !== null;
  const editingRoundIdx = isEditing
    ? rounds.findIndex((r) => r.id === editingRoundId) + 1
    : null;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ═══ Sticky Header ═══ */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        {/* App bar */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 text-base select-none">♥</span>
            <span className="text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Trix & Tarneeb
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
              {rounds.length} round{rounds.length !== 1 ? 's' : ''}
            </span>
            {/* Reset button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Reset game"
              className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-lg transition-colors active:scale-90"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {/* End Game button */}
            <button
              type="button"
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm shadow-rose-900/50"
            >
              <Flag className="w-3.5 h-3.5" />
              End Game
            </button>
          </div>
        </div>

        {/* Player name row */}
        <div className="flex items-end border-t border-slate-800/60 px-2 pb-2 pt-1.5 gap-1">
          <div className={COL_SIDE} />
          {players.map((p) => {
            const isTeamA = p.team === 'A';
            return (
              <div key={p.id} className={`${COL} text-center px-0.5`}>
                {mode === 'teams' && (
                  <span
                    className={`block text-[9px] font-black uppercase mb-0.5 ${isTeamA ? 'text-emerald-400' : 'text-purple-400'
                      }`}
                  >
                    {isTeamA ? 'Tm A' : 'Tm B'}
                  </span>
                )}
                <span className="block text-xs font-bold text-slate-200 truncate leading-tight">
                  {p.name}
                </span>
              </div>
            );
          })}
          <div className={COL_SIDE} />
        </div>
      </header>

      {/* ═══ Running Totals Bar (sticky below header) ═══ */}
      <div className="sticky top-[93px] z-20 bg-slate-900/98 backdrop-blur-sm border-b border-amber-900/40 shadow-sm shadow-amber-950/20">
        <div className="flex items-center gap-1 px-2 py-2 max-w-lg w-full mx-auto">
          <div className={`${COL_SIDE} text-center`}>
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider leading-tight block">
              Total
            </span>
          </div>
          {players.map((p) => {
            const total = totalFor(p.id);
            return (
              <div key={p.id} className={`${COL} text-center`}>
                <span
                  className={`text-sm font-black tabular-nums ${total > 0
                    ? 'text-emerald-400'
                    : total < 0
                      ? 'text-rose-400'
                      : 'text-slate-600'
                    }`}
                >
                  {fmtScore(total)}
                </span>
              </div>
            );
          })}
          <div className={COL_SIDE} />
        </div>
      </div>

      {/* ═══ Main: Rounds List ═══ */}
      <main className="flex-1 flex flex-col max-w-lg w-full mx-auto">

        {/* Empty state */}
        {rounds.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center opacity-70">
            <span className="text-5xl select-none">🃏</span>
            <p className="text-sm font-semibold text-slate-400">
              No rounds yet. Add the first one below!
            </p>
            <p className="text-xs text-slate-500">اضغط "Save Round" لتسجيل الجلسة الأولى</p>
          </div>
        )}

        {/* Round rows */}
        <div className="flex flex-col">
          {rounds.map((round, roundIdx) => {
            const isBeingEdited = editingRoundId === round.id;
            const rowBg = isBeingEdited
              ? 'bg-emerald-950/25 border-l-2 border-emerald-600'
              : roundIdx % 2 === 0
                ? 'bg-slate-950'
                : 'bg-slate-900/40';

            return (
              <div
                key={round.id}
                className={`border-b border-slate-800/50 ${rowBg} transition-colors`}
              >
                <div className="flex items-center gap-1 px-2 py-0.5 min-h-[50px]">
                  {/* Round number */}
                  <div className={`${COL_SIDE} flex flex-col items-center justify-center`}>
                    <span className="text-[10px] font-bold text-slate-600 leading-none">R</span>
                    <span
                      className={`text-sm font-black leading-none ${isBeingEdited ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                    >
                      {roundIdx + 1}
                    </span>
                  </div>

                  {/* Score cells — tap to inline-edit individual cell */}
                  {players.map((p) => (
                    <div key={p.id} className={`${COL} text-center`}>
                      <EditableCell
                        value={sanitizeScore(round.scores[p.id])}
                        onSave={(val) => updateRoundScore(round.id, p.id, val)}
                      />
                    </div>
                  ))}

                  {/* Row actions: Edit (loads into input row) + Delete */}
                  <div className={`${COL_SIDE} flex flex-col items-center justify-center gap-1`}>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() =>
                        isBeingEdited ? handleCancelEdit() : handleEditRound(round.id)
                      }
                      className={`p-1 rounded-md transition-colors active:scale-90 ${isBeingEdited
                        ? 'text-emerald-400 bg-emerald-900/40'
                        : 'text-slate-600 hover:text-sky-400 hover:bg-sky-950/30'
                        }`}
                      title={isBeingEdited ? 'Cancel edit' : 'Edit this round'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(round.id)}
                      className="p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors active:scale-90"
                      title="Delete round"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ Input Row: New Round / Edit Round ═══ */}
        <div
          ref={inputSectionRef}
          className={`sticky bottom-0 z-20 border-t-2 shadow-2xl shadow-slate-950 transition-colors ${isEditing
            ? 'bg-slate-900 border-emerald-600'
            : 'bg-slate-900 border-emerald-700/60'
            }`}
        >
          {/* Mode label */}
          <div className="flex items-center justify-between px-3 pt-2 pb-0">
            <div className="flex items-center gap-1.5">
              {isEditing ? (
                <>
                  <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                    Editing Round {editingRoundIdx}
                  </span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    New Round
                  </span>
                </>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {/* Player name mini labels */}
          <div className="flex items-center gap-1 px-2 pt-1.5 pb-0.5">
            <div className={COL_SIDE} />
            {players.map((p) => (
              <div key={p.id} className={`${COL} text-center`}>
                <span className="text-[9px] font-semibold text-slate-500 truncate block">
                  {p.name.split(' ')[0]}
                </span>
              </div>
            ))}
            <div className={COL_SIDE} />
          </div>

          {/* Number Inputs */}
          <div className="flex items-center gap-1 px-2 pb-1.5 pt-0.5">
            <div className={COL_SIDE} />
            {players.map((p, idx) => {
              const val = draft[p.id] || '';
              const isNegative = val.startsWith('-');

              return (
                <div key={p.id} className={`${COL} px-0.5 flex flex-col gap-1.5`}>
                  {/* الزر السحري للسالب والموجب */}
                  <button
                    type="button"
                    tabIndex={-1} // كي لا يركز عليه الكيبورد أثناء الكتابة
                    onClick={() => {
                      setDraft((prev) => {
                        const current = prev[p.id] || '';
                        if (current === '') return { ...prev, [p.id]: '-' };
                        if (current.startsWith('-')) return { ...prev, [p.id]: current.slice(1) };
                        return { ...prev, [p.id]: '-' + current };
                      });
                    }}
                    className={`w-full py-1.5 rounded-lg text-[13px] font-black tracking-widest transition-colors active:scale-95 border ${isNegative
                      ? 'bg-rose-950/50 text-rose-400 border-rose-800/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                  >
                    +/-
                  </button>

                  {/* مربع الإدخال */}
                  <input
                    ref={(el) => { inputRefs.current[p.id] = el; }}
                    id={`score-input-${p.id}`}
                    type="number"
                    inputMode="numeric" // تم التعديل لإجبار الموبايل على لوحة الأرقام الكبيرة
                    pattern="[0-9]*" // تم التعديل لمنع الكيبورد العادي
                    value={val}
                    placeholder="0"
                    onChange={(e) => {
                      // تنظيف الإدخال للسماح فقط بالأرقام وعلامة السالب
                      const newVal = e.target.value.replace(/[^0-9-]/g, '');
                      handleDraftChange(p.id, newVal);
                    }}
                    onKeyDown={(e) => handleInputKey(e, idx)}
                    onFocus={(e) => e.target.select()}
                    className={`w-full bg-slate-900 border rounded-xl px-1.5 py-3 text-center text-lg font-black placeholder-slate-600 focus:outline-none focus:ring-1 transition-all min-h-[52px] tabular-nums ${isNegative ? 'text-rose-400' : 'text-slate-100'
                      } ${isEditing
                        ? 'border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500'
                        : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500'
                      }`}
                  />
                </div>
              );
            })}
            <div className={COL_SIDE} />
          </div>

          {/* Save / Update button */}
          <div className="px-3 pb-3 pt-1">
            <button
              type="button"
              onClick={handleSaveRound}
              id="save-round-btn"
              className={`w-full py-3.5 rounded-2xl font-black text-base tracking-wide uppercase shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[52px] ${isEditing
                ? 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 active:from-emerald-800 text-white shadow-emerald-900/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white shadow-emerald-900/40'
                }`}
            >
              {isEditing ? (
                <>
                  <SaveAll className="w-5 h-5" />
                  Update Round {editingRoundIdx}
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Save Round • حفظ الجلسة
                </>
              )}
            </button>
          </div>
        </div>

        <div ref={bottomRef} />
      </main>

      {/* ═══ Modals ═══ */}

      {/* End Game confirmation */}
      {showEndConfirm && (
        <ConfirmModal
          emoji="🏁"
          title="End the Game?"
          description="This will calculate final rankings. You'll be able to start a new game after."
          warning={rounds.length === 0 ? '⚠️ No rounds recorded yet!' : undefined}
          confirmLabel="See Results!"
          destructiveLabel="🗑 Discard & Reset Game"
          onConfirm={() => { endGame(); setShowEndConfirm(false); }}
          onCancel={() => setShowEndConfirm(false)}
          onDestructive={() => { resetGame(); setShowEndConfirm(false); }}
        />
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <ConfirmModal
          emoji="🔄"
          title="Reset the Game?"
          description="All recorded rounds will be lost and you'll return to the Setup Screen. This cannot be undone."
          confirmLabel="Yes, Reset"
          onConfirm={() => { resetGame(); setShowResetConfirm(false); }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Delete round confirmation */}
      {pendingDeleteId && (
        <ConfirmModal
          emoji="🗑️"
          title="Delete this round?"
          description="This round's scores will be permanently removed. This cannot be undone."
          confirmLabel="Delete Round"
          onConfirm={() => {
            deleteRound(pendingDeleteId);
            if (editingRoundId === pendingDeleteId) handleCancelEdit();
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
};
