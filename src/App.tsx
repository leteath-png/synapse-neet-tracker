/**
 * SYNAPSE // NEET 2027
 * Executive Study Dashboard (Linear & Apple Health Inspired)
 * 107 Days • 790 Slots • Zero Backlog
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SYNAPSE_SCHEDULE, SUBJECT_METADATA } from './data/schedule';
import { DaySchedule, StudySlot, Subject } from './types';
import { ExecutiveHeader } from './components/ExecutiveHeader';
import { MetricsDeck } from './components/MetricsDeck';
import { ExecutiveDayCard } from './components/ExecutiveDayCard';
import { FlatSlotTimer } from './components/FlatSlotTimer';
import { playTickSound, playCelebrationSound } from './utils/sound';
import {
  Search,
  Target,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowUp,
  SlidersHorizontal,
} from 'lucide-react';

const STORAGE_KEY = 'synapse_state_v1';

export default function App() {
  // 1. LocalStorage state
  const [completedSlots, setCompletedSlots] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completedSlotIds)) {
          return new Set(parsed.completedSlotIds);
        }
      }
    } catch (e) {
      console.warn('Error restoring synapse state', e);
    }
    return new Set<string>();
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') return parsed.soundEnabled;
      }
    } catch {}
    return true;
  });

  // Calculate default day: Oct 11, 2026 is Day 1
  const calculateDefaultDay = useCallback((): number => {
    const start = new Date(2026, 9, 11);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    if (days >= 1 && days <= 107) return days;
    return 1;
  }, []);

  const [activeDayNum, setActiveDayNum] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeDayNum >= 1 && parsed.activeDayNum <= 107) {
          return parsed.activeDayNum;
        }
      }
    } catch {}
    return calculateDefaultDay();
  });

  // 2. Navigation & filter states
  const [activeFilter, setActiveFilter] = useState<'today' | 'backlog' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | Subject>('all');

  // 3. Flat 120-minute Timer state
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerSlot, setTimerSlot] = useState<StudySlot | null>(null);

  // 4. Persistence sync
  useEffect(() => {
    try {
      const payload = {
        completedSlotIds: Array.from(completedSlots),
        activeDayNum,
        soundEnabled,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed saving synapse state', e);
    }
  }, [completedSlots, activeDayNum, soundEnabled]);

  // 5. Checkbox toggling
  const handleToggleSlot = useCallback(
    (slotId: string) => {
      setCompletedSlots((prev) => {
        const next = new Set(prev);
        const wasDone = next.has(slotId);
        if (wasDone) {
          next.delete(slotId);
        } else {
          next.add(slotId);
          if (soundEnabled) playTickSound();
        }

        // Celebrate if day completed
        if (!wasDone) {
          const day = SYNAPSE_SCHEDULE.find((d) => d.slots.some((s) => s.id === slotId));
          if (day && day.slots.every((s) => s.id === slotId || next.has(s.id))) {
            if (soundEnabled) playCelebrationSound();
          }
        }
        return next;
      });
    },
    [soundEnabled]
  );

  const handleToggleAllDay = useCallback(
    (dayNum: number) => {
      const day = SYNAPSE_SCHEDULE.find((d) => d.dayNum === dayNum);
      if (!day) return;

      const isAllDone = day.slots.every((s) => completedSlots.has(s.id));
      setCompletedSlots((prev) => {
        const next = new Set(prev);
        if (isAllDone) {
          day.slots.forEach((s) => next.delete(s.id));
        } else {
          day.slots.forEach((s) => next.add(s.id));
          if (soundEnabled) playCelebrationSound();
        }
        return next;
      });
    },
    [completedSlots, soundEnabled]
  );

  // 6. Metrics Calculation
  const metrics = useMemo(() => {
    let p = 0, c = 0, z = 0, b = 0;
    let totalCompleted = 0;
    let backlogCount = 0;

    for (const day of SYNAPSE_SCHEDULE) {
      for (const slot of day.slots) {
        if (completedSlots.has(slot.id)) {
          totalCompleted++;
          if (slot.subject === 'Physics') p++;
          else if (slot.subject === 'Chemistry') c++;
          else if (slot.subject === 'Zoology') z++;
          else if (slot.subject === 'Botany') b++;
        } else if (day.dayNum < activeDayNum) {
          backlogCount++;
        }
      }
    }

    return {
      totalCompleted,
      totalSlots: 790,
      subjectCounts: {
        Physics: p,
        Chemistry: c,
        Zoology: z,
        Botany: b,
      },
      backlogCount,
    };
  }, [completedSlots, activeDayNum]);

  // 7. Filtered Days
  const filteredDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SYNAPSE_SCHEDULE.filter((day) => {
      const isDayDone = day.slots.every((s) => completedSlots.has(s.id));
      const isPast = day.dayNum < activeDayNum;
      const isBacklog = isPast && !isDayDone;

      // Filter modes
      if (activeFilter === 'today' && day.dayNum !== activeDayNum) return false;
      if (activeFilter === 'backlog' && !isBacklog) return false;

      // Subject filter
      if (subjectFilter !== 'all') {
        const hasSub = day.slots.some((s) => s.subject === subjectFilter);
        if (!hasSub) return false;
      }

      // Search
      if (q) {
        const matchDay = `day ${day.dayNum}`.includes(q);
        const matchDate = day.dateStr.toLowerCase().includes(q) || day.fullDateStr.toLowerCase().includes(q);
        const matchRoutine = day.routineName.toLowerCase().includes(q);
        const matchSub = day.slots.some((s) => s.subject.toLowerCase().includes(q));
        if (!matchDay && !matchDate && !matchRoutine && !matchSub) return false;
      }

      return true;
    });
  }, [activeFilter, subjectFilter, searchQuery, completedSlots, activeDayNum]);

  // 8. Quick Actions Handlers
  const handleJumpToday = () => {
    setActiveFilter('today');
    const el = document.getElementById(`day-card-${activeDayNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleToggleBacklogFilter = () => {
    setActiveFilter((prev) => (prev === 'backlog' ? 'all' : 'backlog'));
  };

  const handleExportJson = () => {
    const data = {
      app: 'SYNAPSE // NEET 2027',
      exportedAt: new Date().toISOString(),
      activeDayNum,
      completedSlotIds: Array.from(completedSlots),
      metrics: {
        completedSlots: metrics.totalCompleted,
        totalSlots: 790,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-neet2027-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.completedSlotIds)) {
          setCompletedSlots(new Set(parsed.completedSlotIds));
          if (parsed.activeDayNum && parsed.activeDayNum >= 1 && parsed.activeDayNum <= 107) {
            setActiveDayNum(parsed.activeDayNum);
          }
        }
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Clear all synapse checkboxes? This resets your progress state.')) {
      setCompletedSlots(new Set());
    }
  };

  const openTimerForSlot = (slot: StudySlot) => {
    setTimerSlot(slot);
    setIsTimerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Executive Header */}
      <ExecutiveHeader
        onJumpToday={handleJumpToday}
        onFilterBacklogs={handleToggleBacklogFilter}
        backlogCount={metrics.backlogCount}
        onOpenTimer={() => {
          setTimerSlot(null);
          setIsTimerOpen(true);
        }}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetData={handleResetData}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeDayNum={activeDayNum}
        onSelectDay={(d) => setActiveDayNum(d)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* 2. Metrics Deck (Master Linear Bar, Apple Health Radial Ring, Subject Pills) */}
        <MetricsDeck
          completedSlots={metrics.totalCompleted}
          totalSlots={metrics.totalSlots}
          subjectCounts={metrics.subjectCounts}
          activeDayNum={activeDayNum}
          backlogSlots={metrics.backlogCount}
        />

        {/* 3. Executive Filter & Fast Navigation Deck */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
          
          {/* Main 3 Filter Tabs: [Today] [Pending Backlogs] [All Days] */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'today'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-[#090D16] text-slate-300 hover:text-white border border-[#1F2937]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>TODAY (DAY {activeDayNum})</span>
            </button>

            <button
              onClick={() => setActiveFilter('backlog')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'backlog'
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(251,113,133,0.25)]'
                  : 'bg-[#090D16] text-slate-300 hover:text-white border border-[#1F2937]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>PENDING BACKLOGS ({metrics.backlogCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-200 text-black'
                  : 'bg-[#090D16] text-slate-300 hover:text-white border border-[#1F2937]'
              }`}
            >
              ALL DAYS (107)
            </button>
          </div>

          {/* Subject Pills Filter & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            
            {/* Subject Filter */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['all', 'Physics', 'Chemistry', 'Zoology', 'Botany'] as const).map((sub) => {
                const isSel = subjectFilter === sub;
                const meta = sub !== 'all' ? SUBJECT_METADATA[sub] : null;

                return (
                  <button
                    key={sub}
                    onClick={() => setSubjectFilter(sub)}
                    className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer border ${
                      isSel
                        ? 'bg-[#1e293b] text-white border-slate-600'
                        : 'bg-[#090D16] text-slate-400 border-[#1F2937] hover:text-slate-200'
                    }`}
                  >
                    {sub === 'all' ? 'ALL' : meta?.code}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Day, Date, or Subject..."
                className="w-full sm:w-44 bg-[#090D16] border border-[#1F2937] rounded-xl pl-8 pr-2.5 py-1 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

          </div>

        </div>

        {/* 4. Schedule Cards Grid */}
        {filteredDays.length === 0 ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-12 text-center space-y-3 font-mono">
            <div className="text-xs text-slate-400">NO DAYS MATCHING CURRENT FILTER CRITERIA</div>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSubjectFilter('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDays.map((day) => {
              const isToday = day.dayNum === activeDayNum;
              const isDayDone = day.slots.every((s) => completedSlots.has(s.id));
              const isBacklog = day.dayNum < activeDayNum && !isDayDone;

              return (
                <ExecutiveDayCard
                  key={day.dayNum}
                  day={day}
                  completedSet={completedSlots}
                  onToggleSlot={handleToggleSlot}
                  onToggleAllDay={handleToggleAllDay}
                  onOpenTimerForSlot={openTimerForSlot}
                  isToday={isToday}
                  isBacklog={isBacklog}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* 5. Flat 120-minute Continuous Timer Modal */}
      <FlatSlotTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        targetSlot={timerSlot}
        onCompleteSlot={(slotId) => handleToggleSlot(slotId)}
        soundEnabled={soundEnabled}
      />

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-2.5 rounded-xl bg-[#111827] hover:bg-[#1a2333] border border-[#1F2937] text-slate-400 hover:text-white shadow-xl transition cursor-pointer z-30"
        title="Scroll Top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Minimal Footer */}
      <footer className="border-t border-[#1F2937] bg-[#090D16] py-5 text-center font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>SYNAPSE // NEET 2027 • 107 DAYS • 790 SLOTS • ZERO BACKLOG</div>
          <div className="text-slate-600">OLED DARK • LINEAR & APPLE HEALTH ARCHITECTURE</div>
        </div>
      </footer>

    </div>
  );
}
