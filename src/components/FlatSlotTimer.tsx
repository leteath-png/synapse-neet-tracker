import React, { useState, useEffect, useRef } from 'react';
import { StudySlot } from '../types';
import { SUBJECT_METADATA } from '../data/schedule';
import { playTimerBell, playTickSound } from '../utils/sound';
import { X, Play, Pause, RotateCcw, Volume2, Check, Clock } from 'lucide-react';

interface FlatSlotTimerProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: StudySlot | null;
  onCompleteSlot: (slotId: string) => void;
  soundEnabled: boolean;
}

export const FlatSlotTimer: React.FC<FlatSlotTimerProps> = ({
  isOpen,
  onClose,
  targetSlot,
  onCompleteSlot,
  soundEnabled,
}) => {
  // Flat 120 minutes = 7200 seconds
  const FLAT_DURATION = 120 * 60; // 7200 seconds
  const [timeLeft, setTimeLeft] = useState<number>(FLAT_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setHasFinished(true);
            if (soundEnabled) playTimerBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  // Reset timer whenever slot changes
  useEffect(() => {
    setTimeLeft(FLAT_DURATION);
    setIsRunning(false);
    setHasFinished(false);
  }, [targetSlot]);

  if (!isOpen) return null;

  const formatHMS = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleRun = () => {
    if (soundEnabled) playTickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (soundEnabled) playTickSound();
    setIsRunning(false);
    setTimeLeft(FLAT_DURATION);
    setHasFinished(false);
  };

  const progressPct = ((FLAT_DURATION - timeLeft) / FLAT_DURATION) * 100;
  const meta = targetSlot ? SUBJECT_METADATA[targetSlot.subject] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              FLAT 2.0-HOUR CONTINUOUS WORK BLOCK
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Slot Details */}
        {targetSlot && meta && (
          <div className="bg-[#090D16] border border-[#1F2937] rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                ACTIVE FOCUS
              </div>
              <div className="text-sm font-mono font-bold text-white flex items-center gap-2 mt-0.5">
                <span>DAY {targetSlot.dayNum} • SLOT #{targetSlot.slotNum}</span>
              </div>
            </div>
            <span
              className="font-mono text-xs font-black px-2 py-0.5 rounded border"
              style={{
                color: meta.hex,
                backgroundColor: `${meta.hex}15`,
                borderColor: `${meta.hex}30`,
              }}
            >
              [{meta.code}] {meta.name}
            </span>
          </div>
        )}

        {/* Big Monospace Display */}
        <div className="bg-[#090D16] border border-[#1F2937] rounded-2xl py-8 px-4 text-center space-y-3">
          <div className="text-5xl font-mono font-black tracking-tight text-white select-none">
            {formatHMS(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-48 mx-auto bg-[#111827] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {hasFinished ? (
              <span className="text-emerald-400 font-bold">120-MIN BLOCK COMPLETED!</span>
            ) : isRunning ? (
              <span>UNINTERRUPTED DEEP WORK IN PROGRESS</span>
            ) : (
              <span>120 MINUTES • ZERO DISTRACTIONS</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-[#090D16] hover:bg-[#1a2333] border border-[#1F2937] text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
            title="Reset to 120 Mins"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleRun}
            className={`px-8 py-3 rounded-xl font-mono text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{timeLeft === 0 ? 'RESTART' : 'START 2H BLOCK'}</span>
              </>
            )}
          </button>

          {targetSlot && (
            <button
              onClick={() => {
                onCompleteSlot(targetSlot.id);
                if (soundEnabled) playTickSound();
                onClose();
              }}
              className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 transition active:scale-95 cursor-pointer"
              title="Mark Slot As Done"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
