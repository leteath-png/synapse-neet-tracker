export type Subject = 'Physics' | 'Chemistry' | 'Zoology' | 'Botany';
export type SubjectCode = 'P' | 'C' | 'Z' | 'B';

export interface StudySlot {
  id: string; // "d1-s1"
  dayNum: number;
  slotNum: number;
  subject: Subject;
  subjectCode: SubjectCode;
  durationMinutes: number; // Flat 120
}

export interface DaySchedule {
  dayNum: number;
  dateStr: string; // "11-Oct-2026"
  fullDateStr: string; // "Sunday, 11 Oct 2026"
  isoDate: string; // "2026-10-11"
  dayOfWeek: number; // 0 = Sun ... 6 = Sat
  routineName: string; // "MWF Routine (8h×2=16h)"
  routineType: 'sun' | 'mwf' | 'tts' | 'mock';
  slots: StudySlot[];
}

export interface SynapseState {
  completedSlotIds: string[];
  activeDayNum: number;
  soundEnabled: boolean;
}
