import { DayOfWeek, TimetableRecord, fetchAllTimetables, matchStudentTimetable } from './timetableData';

export interface SubjectScheduleItem {
  day: DayOfWeek;
  time: string;
  room: string;
}

export interface StudentSubject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  credits: number;
  type: 'Theory' | 'Lab' | 'Tutorial';
  semester: string;
  section: string;
  academicSession: string;
  attendancePercentage: number | null; // null if real attendance is unavailable -> shows '--'
  classesConducted: number;
  classesAttended: number;
  schedule: SubjectScheduleItem[];
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Extracts unique academic subjects from the student's assigned timetable,
 * and attaches real attendance rates if sessions & attendance logs are present.
 */
export function getSubjectsFromTimetable(
  timetable: TimetableRecord | null | undefined,
  sessions: any[] = [],
  attendanceLogs: any[] = []
): StudentSubject[] {
  if (!timetable || !timetable.classes || timetable.classes.length === 0) {
    return [];
  }

  // Filter out non-academic periods like recess and free slots
  const academicPeriods = timetable.classes.filter(
    (c) => c.type !== 'recess' && c.type !== 'free' && c.subject && c.subject.trim() !== ''
  );

  const subjectMap = new Map<string, StudentSubject>();

  for (const period of academicPeriods) {
    const key = period.subject.trim().toLowerCase();
    const existing = subjectMap.get(key);

    const scheduleItem: SubjectScheduleItem = {
      day: period.day,
      time: period.displayTime,
      room: period.room || 'TBA',
    };

    if (existing) {
      existing.schedule.push(scheduleItem);
      // Merge faculty if not already listed
      if (period.faculty && !existing.faculty.includes(period.faculty)) {
        existing.faculty = existing.faculty ? `${existing.faculty}, ${period.faculty}` : period.faculty;
      }
      if ((!existing.code || existing.code === 'ACAD') && period.subjectCode) {
        existing.code = period.subjectCode;
      }
    } else {
      const isLab = period.type === 'lab';
      const isTutorial = period.type === 'tutorial';

      subjectMap.set(key, {
        id: `subj-${key.replace(/[^a-z0-9]/g, '-')}`,
        name: period.subject.trim(),
        code: period.subjectCode || 'ACAD',
        faculty: period.faculty?.trim() || 'Assigned Faculty',
        credits: isLab ? 2 : isTutorial ? 1 : 4,
        type: isLab ? 'Lab' : isTutorial ? 'Tutorial' : 'Theory',
        semester: timetable.semester,
        section: timetable.section,
        academicSession: timetable.academicSession,
        attendancePercentage: null, // default '--'
        classesConducted: 0,
        classesAttended: 0,
        schedule: [scheduleItem],
      });
    }
  }

  // Calculate real attendance for each subject from sessions and logs if available
  if (sessions.length > 0) {
    subjectMap.forEach((subject) => {
      const matchingSessions = sessions.filter((s) => {
        const sSub = (s.subject || '').toLowerCase().trim();
        const subName = subject.name.toLowerCase().trim();
        return sSub === subName || sSub.includes(subName) || subName.includes(sSub);
      });

      if (matchingSessions.length > 0) {
        const matchingIds = new Set(matchingSessions.map((s) => s.id));
        const attendedCount = attendanceLogs.filter((log) => matchingIds.has(log.sessionId)).length;
        const conductedCount = matchingSessions.length;

        subject.classesConducted = conductedCount;
        subject.classesAttended = attendedCount;
        subject.attendancePercentage = conductedCount > 0 ? Math.round((attendedCount / conductedCount) * 100) : null;
      }
    });
  }

  return Array.from(subjectMap.values());
}

/**
 * Loads real subject data for the logged-in student using their academic profile,
 * assigned timetable, and attendance records.
 */
export async function fetchStudentSubjects(user: any): Promise<{
  subjects: StudentSubject[];
  timetable: TimetableRecord | null;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('ems_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // Parallel fetch of timetables, sessions, and student attendance logs
    const [timetables, attRes, sessRes] = await Promise.all([
      fetchAllTimetables(),
      fetch(`${API_BASE}/attendance`, { headers }).catch(() => null),
      fetch(`${API_BASE}/sessions`, { headers }).catch(() => null),
    ]);

    let attendanceLogs: any[] = [];
    let sessions: any[] = [];

    if (attRes && attRes.ok) {
      const attData = await attRes.json();
      const studentId = user?.id;
      const allLogs = attData.attendance || [];
      attendanceLogs = studentId ? allLogs.filter((l: any) => l.studentId === studentId) : allLogs;
    }

    if (sessRes && sessRes.ok) {
      const sessData = await sessRes.json();
      sessions = sessData.sessions || [];
    }

    // Match student's assigned timetable
    const { timetable } = matchStudentTimetable(timetables, user);

    // If student has no assigned profile or no timetable, return empty subjects list
    if (!timetable) {
      return { subjects: [], timetable: null };
    }

    const subjects = getSubjectsFromTimetable(timetable, sessions, attendanceLogs);

    return { subjects, timetable };
  } catch (err: any) {
    console.error('Error fetching student subjects:', err);
    return { subjects: [], timetable: null, error: err.message || 'Failed to fetch student subjects' };
  }
}
