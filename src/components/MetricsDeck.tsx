import React from 'react';
import { Subject } from '../types';
import { SUBJECT_METADATA } from '../data/schedule';

interface MetricsDeckProps {
  completedSlots: number;
  totalSlots: number; // 790
  subjectCounts: Record<Subject, number>;
  activeDayNum: number;
  backlogSlots: number;
}

export const MetricsDeck: React.FC<MetricsDeckProps> = ({
  completedSlots,
  totalSlots,
  subjectCounts,
  activeDayNum,
  backlogSlots,
}) => {
  const percent = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 0;
  const totalHours = completedSlots * 2;
  const remainingSlots = Math.max(0, totalSlots - completedSlots);

  // Radial Ring Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percent / 100);

  const subjects: Subject[] = ['Physics', 'Chemistry', 'Zoology', 'Botany'];

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      
      {/* Top Deck: Master Metric & Apple Health Style Radial Ring */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-5 border-b border-[#1F2937]/70">
        
        {/* Left: Progress Summary & Bar */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                MASTER CURRICULUM DISCIPLINE
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-black text-white">{percent.toFixed(1)}%</span>
              <span className="text-xs text-slate-500 ml-1.5">
                ({completedSlots}/{totalSlots} SLOTS)
              </span>
            </div>
          </div>

          {/* Master Linear Bar */}
          <div className="h-2 w-full bg-[#090D16] rounded-full overflow-hidden border border-[#1F2937]/50 p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(56,189,248,0.3)]"
              style={{ width: `${Math.min(100, Math.max(0.5, percent))}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
            <span>
              LOGGED: <strong className="text-slate-200">{totalHours}h</strong> (2.0h / Slot)
            </span>
            <span>
              REMAINING: <strong className="text-slate-200">{remainingSlots}</strong> Slots ({remainingSlots * 2}h)
            </span>
            <span>
              PACE: <strong className={backlogSlots === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {backlogSlots === 0 ? 'ZERO BACKLOG' : `${backlogSlots} SLOTS BEHIND`}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Apple Health Inspired Radial Gauge */}
        <div className="flex items-center gap-4 lg:pl-6 lg:border-l border-[#1F2937]/70 flex-shrink-0">
          <div className="relative w-22 h-22 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#090D16]"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#38BDF8"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-base font-black font-mono text-white leading-none">
                {percent.toFixed(0)}%
              </div>
              <div className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                EXEC
              </div>
            </div>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="text-slate-400 text-[11px]">TARGET NEET 2027</div>
            <div className="text-white font-bold">107 DAYS TOTAL</div>
            <div className="text-[10px] text-cyan-400">ACTIVE: DAY {activeDayNum}</div>
          </div>
        </div>

      </div>

      {/* Bottom Deck: Exact Subject Completion Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
        {subjects.map((sub) => {
          const meta = SUBJECT_METADATA[sub];
          const count = subjectCounts[sub] || 0;
          const subPct = meta.target > 0 ? (count / meta.target) * 100 : 0;

          return (
            <div
              key={sub}
              className="bg-[#090D16] border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-mono text-xs font-black px-1.5 py-0.5 rounded border text-[11px]"
                  style={{
                    color: meta.hex,
                    backgroundColor: `${meta.hex}15`,
                    borderColor: `${meta.hex}35`,
                  }}
                >
                  {meta.code}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {subPct.toFixed(0)}%
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {meta.name}
                </div>
                <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                  [ {count} / {meta.target} ]
                </div>
              </div>

              {/* Minimal bar */}
              <div className="w-full bg-[#111827] rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(1, subPct))}%`,
                    backgroundColor: meta.hex,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
