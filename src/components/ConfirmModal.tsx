import React from 'react';
import { X, Check } from 'lucide-react';

interface ConfirmModalProps {
  /** Emoji or large icon to display at the top */
  emoji?: string;
  title: string;
  description?: string;
  /** Warning banner text (e.g. "No rounds recorded!") */
  warning?: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Extra destructive action at the very bottom */
  destructiveLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onDestructive?: () => void;
  /** Tailwind gradient classes for the confirm button */
  confirmButtonClass?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  emoji = '⚠️',
  title,
  description,
  warning,
  confirmLabel = 'Confirm',
  destructiveLabel,
  onConfirm,
  onCancel,
  onDestructive,
  confirmButtonClass = 'from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-700',
}) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm px-4 pb-6"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl shadow-black/60 flex flex-col gap-4">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2 select-none">{emoji}</div>
        <h3 className="text-lg font-extrabold text-slate-100">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Optional warning badge */}
      {warning && (
        <div className="bg-amber-950/50 border border-amber-600/40 rounded-xl px-3 py-2 text-xs text-amber-300 text-center font-medium">
          {warning}
        </div>
      )}

      {/* Primary actions */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-300 font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 min-h-[52px]"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 py-3.5 bg-gradient-to-r ${confirmButtonClass} text-white font-bold rounded-2xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 min-h-[52px]`}
        >
          <Check className="w-4 h-4" />
          {confirmLabel}
        </button>
      </div>

      {/* Optional destructive tertiary action */}
      {destructiveLabel && onDestructive && (
        <button
          type="button"
          onClick={onDestructive}
          className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors rounded-xl hover:bg-rose-950/20"
        >
          {destructiveLabel}
        </button>
      )}
    </div>
  </div>
);
