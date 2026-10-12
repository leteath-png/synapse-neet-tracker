import React, { useRef } from 'react';
import {
  Clock,
  Download,
  Upload,
  Calendar,
  Volume2,
  VolumeX,
  Target,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ExecutiveHeaderProps {
  onJumpToday: () => void;
  onFilterBacklogs: () => void;
  backlogCount: number;
  onOpenTimer: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetData: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeDayNum: number;
  onSelectDay: (day: number) => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  onJumpToday,
  onFilterBacklogs,
  backlogCount,
  onOpenTimer,
  onExportJson,
  onImportJson,
  onResetData,
  soundEnabled,
  onToggleSound,
  activeDayNum,
  onSelectDay,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-xl border-b border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
        
        {/* Core Identity */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1F2937] flex items-center justify-center font-mono font-black text-xs text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.15)]">
              //
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  SYNAPSE <span className="text-slate-500 font-normal">//</span> NEET 2027
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  EXEC
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-tight">
                13-Oct-2026 → 26-Jan-2027 • 790 Slots • Zero Backlog
              </p>
            </div>
          </div>

          {/* Mobile Timer Trigger */}
          <button
            onClick={onOpenTimer}
            className="md:hidden px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-cyan-400 text-xs font-mono flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>120m</span>
          </button>
        </div>

        {/* Action Deck & Fast Navigator */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Day Jump Select */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 text-[11px]">DAY:</span>
            <select
              value={activeDayNum}
              onChange={(e) => onSelectDay(Number(e.target.value))}
              className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 107 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-[#111827] text-slate-200">
                  {d < 10 ? `0${d}` : d} / 107
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onJumpToday}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f293d] border border-[#1F2937] text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Today's Target</span>
          </button>

          <button
            onClick={onFilterBacklogs}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              backlogCount > 0
                ? 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-800/60 text-rose-300'
                : 'bg-[#111827] hover:bg-[#1f293d] border-[#1F2937] text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Backlogs ({backlogCount})</span>
          </button>

          <button
            onClick={onOpenTimer}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.1)]"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>2h Timer</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportJson}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f293d] border border-[#1F2937] text-slate-300 text-xs font-mono transition cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f293d] border border-[#1F2937] text-slate-300 text-xs font-mono transition cursor-pointer"
            title="Import JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJson(file);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1f293d] border border-[#1F2937] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={soundEnabled ? 'Audio Chime Active' : 'Audio Chime Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Reset State */}
          <button
            onClick={onResetData}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-rose-950/30 border border-[#1F2937] text-slate-500 hover:text-rose-400 transition cursor-pointer"
            title="Reset Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
};
