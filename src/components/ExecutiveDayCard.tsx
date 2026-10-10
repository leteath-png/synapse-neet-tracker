import React from 'react';
import { DaySchedule, StudySlot } from '../types';
import { SUBJECT_METADATA } from '../data/schedule';
import { Check, Clock, AlertTriangle, RotateCcw, CheckCheck } from 'lucide-react';

interface ExecutiveDayCardProps {
  day: DaySchedule;
  completedSet: Set<string>;
  onToggleSlot: (slotId: string) => void;
  onToggleAllDay: (dayNum: number) => void;
  onOpenTimerForSlot: (slot: StudySlot) => void;
  isToday: boolean;
  isBacklog: boolean;
}

export const ExecutiveDayCard: React.FC<ExecutiveDayCardProps> = ({
  day,
  completedSet,
  onToggleSlot,
  onToggleAllDay,
  onOpenTimerForSlot,
  isToday,
  isBacklog,
}) => {
  const completedCount = day.slots.filter((s) => completedSet.has(s.id)).length;
  const totalCount = day.slots.length;
  const is100Done = totalCount > 0 && completedCount === totalCount;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  let borderStyle = 'border-[#1F2937]';
  if (is100Done) {
    borderStyle = 'border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.06)]';
  } else if (isToday) {
    borderStyle = 'border-cyan-500/60 shadow-[0_0_20px_rgba(56,189,248,0.12)] ring-1 ring-cyan-500/30';
  } else if (isBacklog) {
    borderStyle = 'border-rose-500/40 shadow-[0_0_15px_rgba(251,113,133,0.06)]';
  }

  return (
    <div
      id={`day-card-${day.dayNum}`}
      className={`bg-[#111827] border ${borderStyle} rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1F2937]/70 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-cyan-400">
                DAY {day.dayNum < 10 ? `0${day.dayNum}` : day.dayNum}
              </span>

              {isToday && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-black">
                  TODAY
                </span>
              )}

              {isBacklog && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> BACKLOG
                </span>
              )}

              {is100Done && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  DONE
                </span>
              )}
            </div>

            <h3 className="text-xs font-bold font-mono text-slate-200 mt-0.5">
              {day.fullDateStr}
            </h3>

            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {day.routineName}
            </div>
          </div>

          {/* Quick Complete / Reset */}
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-300">
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={() => onToggleAllDay(day.dayNum)}
              className="block text-[10px] font-mono text-slate-500 hover:text-slate-300 mt-1 cursor-pointer"
            >
              {is100Done ? 'Reset' : 'Check All'}
            </button>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-[#090D16] rounded-full h-1 mb-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              is100Done ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Slots List (Exact Sequence) */}
        <div className="space-y-1.5">
          {day.slots.map((slot) => {
            const isDone = completedSet.has(slot.id);
            const meta = SUBJECT_METADATA[slot.subject];

            return (
              <div
                key={slot.id}
                onClick={() => onToggleSlot(slot.id)}
                className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                  isDone
                    ? 'bg-[#090D16]/60 border-[#1F2937]/50 opacity-75'
                    : 'bg-[#090D16] border-[#1F2937] hover:border-slate-700 hover:bg-[#0c1220]'
                }`}
              >
                {/* Left: Checkbox & Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                        : 'border-[#1F2937] group-hover:border-slate-600 bg-[#111827]'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs font-mono transition ${
                      isDone
                        ? 'line-through text-slate-500'
                        : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    Slot {slot.slotNum}: {slot.subject}
                  </span>
                </div>

                {/* Right: Badge & 2h Timer Trigger */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border"
                    style={{
                      color: isDone ? '#94A3B8' : meta.hex,
                      backgroundColor: isDone ? 'transparent' : `${meta.hex}12`,
                      borderColor: isDone ? '#1F2937' : `${meta.hex}25`,
                    }}
                  >
                    {meta.code} • 2.0h
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTimerForSlot(slot);
                    }}
                    className="p-1 rounded text-slate-600 hover:text-cyan-400 hover:bg-[#111827] transition cursor-pointer"
                    title="Launch 2h Flat Timer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-[#1F2937]/70 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>{totalCount * 2}h Scheduled</span>
        <span>{pct.toFixed(0)}% Cleared</span>
      </div>
    </div>
  );
};
