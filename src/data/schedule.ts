import { DaySchedule, StudySlot, Subject, SubjectCode } from '../types';

export const SUBJECT_METADATA: Record<
  Subject,
  {
    code: SubjectCode;
    name: string;
    target: number;
    color: string;
    hex: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    glow: string;
  }
> = {
  Physics: {
    code: 'P',
    name: 'Physics',
    target: 268,
    color: 'cyan',
    hex: '#38BDF8',
    bgBadge: 'bg-cyan-500/10',
    textBadge: 'text-cyan-400',
    borderBadge: 'border-cyan-500/20',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  Chemistry: {
    code: 'C',
    name: 'Chemistry',
    target: 237,
    color: 'amber',
    hex: '#F59E0B',
    bgBadge: 'bg-amber-500/10',
    textBadge: 'text-amber-400',
    borderBadge: 'border-amber-500/20',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  Zoology: {
    code: 'Z',
    name: 'Zoology',
    target: 164,
    color: 'rose',
    hex: '#FB7185',
    bgBadge: 'bg-rose-500/10',
    textBadge: 'text-rose-400',
    borderBadge: 'border-rose-500/20',
    glow: 'rgba(251, 113, 133, 0.25)',
  },
  Botany: {
    code: 'B',
    name: 'Botany',
    target: 121,
    color: 'emerald',
    hex: '#34D399',
    bgBadge: 'bg-emerald-500/10',
    textBadge: 'text-emerald-400',
    borderBadge: 'border-emerald-500/20',
    glow: 'rgba(52, 211, 153, 0.25)',
  },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatFullDate(d: Date) {
  const dayName = DAY_NAMES[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

// 107 Days generator
export function generateSynapseSchedule(): DaySchedule[] {
  const days: DaySchedule[] = [];
  const startDate = new Date(2026, 9, 11); // Oct 11, 2026 (Sunday)

  for (let i = 0; i < 107; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + i);

    const dayNum = i + 1;
    const dayOfWeek = curDate.getDay(); // 0 = Sun ... 6 = Sat
    const dateStr = formatDate(curDate);
    const fullDateStr = formatFullDate(curDate);
    const isoDate = curDate.toISOString().split('T')[0];

    let sequence: Subject[] = [];
    let routineName = '';
    let routineType: 'sun' | 'mwf' | 'tts' | 'mock' = 'mwf';

    // Day 105, 106, 107 are Full Length All-India Mock sprints
    if (dayNum === 105) {
      routineType = 'mock';
      routineName = 'All-India Full Mock Exam 01';
      sequence = ['Physics', 'Chemistry', 'Zoology', 'Botany'];
    } else if (dayNum === 106) {
      routineType = 'mock';
      routineName = 'All-India Full Mock Exam 02';
      sequence = ['Physics', 'Chemistry', 'Zoology', 'Botany'];
    } else if (dayNum === 107) {
      routineType = 'mock';
      routineName = 'Final Formula & Mindset Consolidation';
      sequence = ['Physics', 'Chemistry', 'Zoology', 'Botany'];
    } else if (dayNum === 35 || dayNum === 70 || dayNum === 98) {
      // Milestone review days
      routineType = 'mock';
      routineName = `Milestone Unit Assessment (Class ${dayNum < 50 ? '11 Part' : dayNum < 80 ? '11 Full' : '12 Full'})`;
      sequence = ['Physics', 'Chemistry', 'Zoology', 'Botany'];
    } else if (dayNum === 52 || dayNum === 66 || dayNum === 80 || dayNum === 94) {
      // High-yield sprint day (6 slots)
      routineType = 'mock';
      routineName = 'NCERT Exemplar & Problem Acceleration';
      sequence = ['Physics', 'Chemistry', 'Zoology', 'Botany', 'Zoology', 'Botany'];
    } else if (dayOfWeek === 0) {
      // Sunday: 6 slots (C -> C -> Z -> Z -> B -> B)
      routineType = 'sun';
      routineName = 'Sunday Deep Routine (6 Slots)';
      sequence = ['Chemistry', 'Chemistry', 'Zoology', 'Zoology', 'Botany', 'Botany'];
    } else if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      // MWF: 8 slots (P -> P -> C -> Z -> B -> C -> C -> P)
      routineType = 'mwf';
      routineName = 'MWF Routine (8 Slots)';
      sequence = ['Physics', 'Physics', 'Chemistry', 'Zoology', 'Botany', 'Chemistry', 'Chemistry', 'Physics'];
    } else {
      // TTS: 8 slots (P -> P -> C -> Z -> Z -> B -> C -> P)
      routineType = 'tts';
      routineName = 'TTS Routine (8 Slots)';
      sequence = ['Physics', 'Physics', 'Chemistry', 'Zoology', 'Zoology', 'Botany', 'Chemistry', 'Physics'];
    }

    const slots: StudySlot[] = sequence.map((subject, idx) => ({
      id: `d${dayNum}-s${idx + 1}`,
      dayNum,
      slotNum: idx + 1,
      subject,
      subjectCode: SUBJECT_METADATA[subject].code,
      durationMinutes: 120, // Flat 2 Hours
    }));

    days.push({
      dayNum,
      dateStr,
      fullDateStr,
      isoDate,
      dayOfWeek,
      routineName,
      routineType,
      slots,
    });
  }

  // Exact target calibration: P: 268, C: 237, Z: 164, B: 121 (Total: 790)
  return calibrateExactQuotas(days);
}

function calibrateExactQuotas(days: DaySchedule[]): DaySchedule[] {
  const TARGET_P = 268;
  const TARGET_C = 237;
  const TARGET_Z = 164;
  const TARGET_B = 121;
  const TARGET_TOTAL = 790;

  let totalSlots = 0;
  for (const day of days) totalSlots += day.slots.length;

  let diff = totalSlots - TARGET_TOTAL;
  // Trim extra slots from final review days if needed
  if (diff > 0) {
    for (let d = 104; d >= 85 && diff > 0; d--) {
      const day = days[d];
      if (day && day.slots.length > 6) {
        day.slots.pop();
        diff--;
      }
    }
  }

  // Count subjects
  let p = 0, c = 0, z = 0, b = 0;
  for (const day of days) {
    for (const slot of day.slots) {
      if (slot.subject === 'Physics') p++;
      else if (slot.subject === 'Chemistry') c++;
      else if (slot.subject === 'Zoology') z++;
      else if (slot.subject === 'Botany') b++;
    }
  }

  // Target balancing
  const need: Subject[] = [];
  while (p < TARGET_P) { need.push('Physics'); p++; }
  while (c < TARGET_C) { need.push('Chemistry'); c++; }
  while (z < TARGET_Z) { need.push('Zoology'); z++; }
  while (b < TARGET_B) { need.push('Botany'); b++; }

  for (let i = days.length - 1; i >= 0 && need.length > 0; i--) {
    const day = days[i];
    for (const slot of day.slots) {
      if (need.length === 0) break;
      if (slot.subject === 'Physics' && p > TARGET_P) {
        const replace = need.pop()!;
        slot.subject = replace;
        slot.subjectCode = SUBJECT_METADATA[replace].code;
        p--;
      } else if (slot.subject === 'Chemistry' && c > TARGET_C) {
        const replace = need.pop()!;
        slot.subject = replace;
        slot.subjectCode = SUBJECT_METADATA[replace].code;
        c--;
      } else if (slot.subject === 'Zoology' && z > TARGET_Z) {
        const replace = need.pop()!;
        slot.subject = replace;
        slot.subjectCode = SUBJECT_METADATA[replace].code;
        z--;
      } else if (slot.subject === 'Botany' && b > TARGET_B) {
        const replace = need.pop()!;
        slot.subject = replace;
        slot.subjectCode = SUBJECT_METADATA[replace].code;
        b--;
      }
    }
  }

  // Re-index slots
  for (const day of days) {
    day.slots.forEach((slot, index) => {
      slot.slotNum = index + 1;
      slot.id = `d${day.dayNum}-s${index + 1}`;
    });
  }

  return days;
}

export const SYNAPSE_SCHEDULE: DaySchedule[] = generateSynapseSchedule();
