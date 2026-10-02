export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type PeriodType = 'theory' | 'lab' | 'tutorial' | 'recess' | 'free';

export interface TimetablePeriod {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:mm 24-hr format
  endTime: string;   // HH:mm 24-hr format
  displayTime: string; // "09:00–10:40"
  subject: string;
  subjectCode?: string;
  faculty: string;
  room: string;
  type: PeriodType;
  label?: string;
  program?: string;
  semester?: string;
  section?: string;
}

export interface TimetableRecord {
  id: string;
  program: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  academicSession: string;
  classes: TimetablePeriod[];
  createdAt: number;
  updatedAt: number;
}

export const TIMETABLE_METADATA = {
  program: 'B.Tech AI & ML',
  department: 'Artificial Intelligence & Machine Learning',
  year: '3rd Year',
  semester: '5th Semester',
  section: 'AIML A',
  academicSession: '2024-2025'
};


export const TIME_SLOTS = [
  '09:00–09:50',
  '09:50–10:40',
  '10:40–11:30',
  '11:30–12:20',
  '12:20–01:10',
  '01:10–02:00', // RECESS
  '02:00–02:50',
  '02:50–03:40',
  '03:40–04:30',
  '04:30–05:20'
];

export const TIMETABLE_WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

export const REAL_TIMETABLE: TimetablePeriod[] = [
  // ================= MONDAY =================
  {
    id: 'mon-1',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:40',
    displayTime: '09:00–10:40',
    subject: 'Intro to ML',
    faculty: 'UKS',
    room: '6010',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'mon-2',
    day: 'Monday',
    startTime: '10:40',
    endTime: '12:20',
    displayTime: '10:40–12:20',
    subject: 'IM',
    faculty: 'VFI',
    room: '6010',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'mon-3',
    day: 'Monday',
    startTime: '12:20',
    endTime: '13:10',
    displayTime: '12:20–01:10',
    subject: 'Free Period',
    faculty: '',
    room: '',
    type: 'free',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'mon-recess',
    day: 'Monday',
    startTime: '13:10',
    endTime: '14:00',
    displayTime: '01:10–02:00',
    subject: 'RECESS',
    faculty: '',
    room: 'Campus Break',
    type: 'recess',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'mon-4',
    day: 'Monday',
    startTime: '14:00',
    endTime: '15:40',
    displayTime: '02:00–03:40',
    subject: 'Pattern Recognition',
    faculty: 'SC',
    room: '6010',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'mon-5',
    day: 'Monday',
    startTime: '15:40',
    endTime: '17:20',
    displayTime: '03:40–05:20',
    subject: 'MATH',
    faculty: 'AP',
    room: '6010',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },

  // ================= TUESDAY =================
  {
    id: 'tue-1',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '11:30',
    displayTime: '09:00–11:30',
    subject: 'OOP Lab',
    faculty: 'HB, Sourav, Ritwika',
    room: '13013',
    type: 'lab',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'tue-2',
    day: 'Tuesday',
    startTime: '11:30',
    endTime: '13:10',
    displayTime: '11:30–01:10',
    subject: 'Cloud Computing',
    faculty: 'SD1',
    room: '13014',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'tue-recess',
    day: 'Tuesday',
    startTime: '13:10',
    endTime: '14:00',
    displayTime: '01:10–02:00',
    subject: 'RECESS',
    faculty: '',
    room: 'Campus Break',
    type: 'recess',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'tue-3',
    day: 'Tuesday',
    startTime: '14:00',
    endTime: '14:50',
    displayTime: '02:00–02:50',
    subject: 'OS',
    faculty: 'HB',
    room: '7009',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'tue-4',
    day: 'Tuesday',
    startTime: '14:50',
    endTime: '15:40',
    displayTime: '02:50–03:40',
    subject: 'MATH',
    faculty: 'AP',
    room: '7009',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'tue-5',
    day: 'Tuesday',
    startTime: '15:40',
    endTime: '17:20',
    displayTime: '03:40–05:20',
    subject: 'OOP',
    faculty: 'HB',
    room: '7009',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },

  // ================= WEDNESDAY =================
  {
    id: 'wed-1',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '11:30',
    displayTime: '09:00–11:30',
    subject: 'Free Period',
    faculty: '',
    room: '',
    type: 'free',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'wed-2',
    day: 'Wednesday',
    startTime: '11:30',
    endTime: '12:20',
    displayTime: '11:30–12:20',
    subject: 'Pattern Recognition',
    faculty: 'SC',
    room: '6002',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'wed-3',
    day: 'Wednesday',
    startTime: '12:20',
    endTime: '13:10',
    displayTime: '12:20–01:10',
    subject: 'Intro to ML',
    faculty: 'UKS',
    room: 'LAB 13',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'wed-recess',
    day: 'Wednesday',
    startTime: '13:10',
    endTime: '14:00',
    displayTime: '01:10–02:00',
    subject: 'RECESS',
    faculty: '',
    room: 'Campus Break',
    type: 'recess',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'wed-4',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '17:20',
    displayTime: '02:00–05:20',
    subject: 'OS Lab',
    faculty: 'SD, PM, Avik',
    room: 'LAB 13',
    type: 'lab',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },

  // ================= THURSDAY =================
  {
    id: 'thu-1',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '13:10',
    displayTime: '09:00–01:10',
    subject: 'Free Period',
    faculty: '',
    room: '',
    type: 'free',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'thu-recess',
    day: 'Thursday',
    startTime: '13:10',
    endTime: '14:00',
    displayTime: '01:10–02:00',
    subject: 'RECESS',
    faculty: '',
    room: 'Campus Break',
    type: 'recess',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'thu-2',
    day: 'Thursday',
    startTime: '14:00',
    endTime: '17:20',
    displayTime: '02:00–05:20',
    subject: 'ML Lab',
    faculty: 'New Faculty 2, Avik, Sourav',
    room: '13013',
    type: 'lab',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },

  // ================= FRIDAY =================
  {
    id: 'fri-1',
    day: 'Friday',
    startTime: '09:00',
    endTime: '11:30',
    displayTime: '09:00–11:30',
    subject: 'Free Period',
    faculty: '',
    room: '',
    type: 'free',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'fri-2',
    day: 'Friday',
    startTime: '11:30',
    endTime: '13:10',
    displayTime: '11:30–01:10',
    subject: 'OOP',
    faculty: 'HB',
    room: 'LAB 13',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'fri-recess',
    day: 'Friday',
    startTime: '13:10',
    endTime: '14:00',
    displayTime: '01:10–02:00',
    subject: 'RECESS',
    faculty: '',
    room: 'Campus Break',
    type: 'recess',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'fri-3',
    day: 'Friday',
    startTime: '14:00',
    endTime: '15:40',
    displayTime: '02:00–03:40',
    subject: 'OS',
    faculty: 'SD',
    room: 'LAB 13',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  },
  {
    id: 'fri-4',
    day: 'Friday',
    startTime: '15:40',
    endTime: '17:20',
    displayTime: '03:40–05:20',
    subject: 'Cloud Computing',
    faculty: 'SD1',
    room: 'LAB 13',
    type: 'theory',
    program: 'B.Tech AI & ML',
    semester: '5th Semester',
    section: 'AIML A'
  }
];

export const DEFAULT_AIML_A_RECORD: TimetableRecord = {
  id: 'initial-aiml-a-5th-sem',
  program: 'B.Tech AI & ML',
  department: 'Artificial Intelligence & Machine Learning',
  year: '3rd Year',
  semester: '5th Semester',
  section: 'AIML A',
  academicSession: '2024-2025',
  classes: REAL_TIMETABLE,
  createdAt: 1727913600000,
  updatedAt: 1727913600000
};

export const ALL_TIMETABLE_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Helper to get minutes from "HH:mm"
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Get classes for a specific day from an optional period list (defaulting to REAL_TIMETABLE)
export function getClassesForDay(day: DayOfWeek, periods: TimetablePeriod[] = REAL_TIMETABLE): TimetablePeriod[] {
  return periods
    .filter((p) => p.day === day)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

// Determine current and next class for today
export function getTodayClassStatus(
  day: DayOfWeek,
  currentMinutes: number,
  periods: TimetablePeriod[] = REAL_TIMETABLE
): {
  currentClass: TimetablePeriod | null;
  nextClass: TimetablePeriod | null;
} {
  const dayPeriods = getClassesForDay(day, periods);
  let currentClass: TimetablePeriod | null = null;
  let nextClass: TimetablePeriod | null = null;

  for (const period of dayPeriods) {
    const start = timeToMinutes(period.startTime);
    const end = timeToMinutes(period.endTime);

    if (currentMinutes >= start && currentMinutes < end) {
      currentClass = period;
    } else if (currentMinutes < start && !nextClass) {
      nextClass = period;
    }
  }

  return { currentClass, nextClass };
}

// ======================= API CLIENT METHODS =======================

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ems_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchAllTimetables(): Promise<TimetableRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/timetables`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.timetables) && data.timetables.length > 0) {
        localStorage.setItem('cached_timetables', JSON.stringify(data.timetables));
        return data.timetables;
      }
    }
  } catch (err) {
    console.warn('API fetch for timetables failed, falling back to cache/default', err);
  }

  const cached = localStorage.getItem('cached_timetables');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return [DEFAULT_AIML_A_RECORD];
}

export async function saveTimetableApi(
  record: Omit<TimetableRecord, 'id' | 'createdAt' | 'updatedAt'>,
  id?: string
): Promise<{ ok: boolean; timetable?: TimetableRecord; error?: string }> {
  try {
    const url = id ? `${API_BASE}/timetables/${id}` : `${API_BASE}/timetables`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(record)
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Failed to save timetable' };
    }
    return { ok: true, timetable: data.timetable };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error while saving timetable' };
  }
}

export async function deleteTimetableApi(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/timetables/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Failed to delete timetable' };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error while deleting timetable' };
  }
}

export function matchStudentTimetable(
  timetables: TimetableRecord[],
  student: {
    program?: string;
    department?: string;
    year?: string;
    semester?: string;
    section?: string;
    academicSession?: string;
  } | null | undefined
): { timetable: TimetableRecord; isMatched: boolean } {
  if (!timetables || timetables.length === 0) {
    return { timetable: DEFAULT_AIML_A_RECORD, isMatched: false };
  }

  if (!student) {
    return { timetable: timetables[0], isMatched: false };
  }

  const norm = (s: string = '') => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const prog = norm(student.program);
  const sem = norm(student.semester);
  const sec = norm(student.section);

  if (sem && sec) {
    // 1. Exact match on Program + Sem + Sec
    const exact = timetables.find((t) => {
      const tProg = norm(t.program);
      const tSem = norm(t.semester);
      const tSec = norm(t.section);
      return (
        (tProg === prog || tProg.includes(prog) || prog.includes(tProg)) &&
        (tSem === sem || tSem.includes(sem) || sem.includes(tSem)) &&
        (tSec === sec || tSec.includes(sec) || sec.includes(tSec))
      );
    });
    if (exact) return { timetable: exact, isMatched: true };

    // 2. Match on Sem + Sec
    const semSec = timetables.find((t) => {
      const tSem = norm(t.semester);
      const tSec = norm(t.section);
      return (
        (tSem === sem || tSem.includes(sem) || sem.includes(tSem)) &&
        (tSec === sec || tSec.includes(sec) || sec.includes(tSec))
      );
    });
    if (semSec) return { timetable: semSec, isMatched: true };
  }

  // Fallback to default routine
  return { timetable: timetables[0] || DEFAULT_AIML_A_RECORD, isMatched: false };
}

