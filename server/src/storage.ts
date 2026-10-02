import fs from "fs";
import path from "path";
import { 
  AttendanceLogRecord, 
  SessionRecord, 
  TimetableRecord, 
  UserRecord,
  NotificationRecord,
  PerformanceRecord,
  AssignmentRecord,
  SubmissionRecord,
  MaterialRecord,
  AnnouncementRecord,
  LeaveRequestRecord,
  AttendanceCorrectionRecord,
  UserSettingsRecord
} from "./types";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");
const TIMETABLES_FILE = path.join(DATA_DIR, "timetables.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const PERFORMANCE_FILE = path.join(DATA_DIR, "performance.json");
const ASSIGNMENTS_FILE = path.join(DATA_DIR, "assignments.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const MATERIALS_FILE = path.join(DATA_DIR, "materials.json");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");
const LEAVE_REQUESTS_FILE = path.join(DATA_DIR, "leave_requests.json");
const CORRECTIONS_FILE = path.join(DATA_DIR, "attendance_corrections.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export const DEFAULT_AIML_A_TIMETABLE: TimetableRecord = {
  id: "initial-aiml-a-5th-sem",
  program: "B.Tech AI & ML",
  department: "Artificial Intelligence & Machine Learning",
  year: "3rd Year",
  semester: "5th Semester",
  section: "AIML A",
  academicSession: "2024-2025",
  classes: [
    // Monday
    { id: "mon-1", day: "Monday", startTime: "09:00", endTime: "10:40", displayTime: "09:00–10:40", subject: "Intro to ML", subjectCode: "AIML501", faculty: "UKS", room: "6010", type: "theory" },
    { id: "mon-2", day: "Monday", startTime: "10:40", endTime: "12:20", displayTime: "10:40–12:20", subject: "IM", subjectCode: "AIML502", faculty: "VFI", room: "6010", type: "theory" },
    { id: "mon-3", day: "Monday", startTime: "12:20", endTime: "13:10", displayTime: "12:20–01:10", subject: "Free Period", faculty: "", room: "", type: "free" },
    { id: "mon-recess", day: "Monday", startTime: "13:10", endTime: "14:00", displayTime: "01:10–02:00", subject: "RECESS", faculty: "", room: "Campus Break", type: "recess" },
    { id: "mon-4", day: "Monday", startTime: "14:00", endTime: "15:40", displayTime: "02:00–03:40", subject: "Pattern Recognition", subjectCode: "AIML503", faculty: "SC", room: "6010", type: "theory" },
    { id: "mon-5", day: "Monday", startTime: "15:40", endTime: "17:20", displayTime: "03:40–05:20", subject: "MATH", subjectCode: "MTH501", faculty: "AP", room: "6010", type: "theory" },

    // Tuesday
    { id: "tue-1", day: "Tuesday", startTime: "09:00", endTime: "11:30", displayTime: "09:00–11:30", subject: "OOP Lab", subjectCode: "CS501L", faculty: "HB, Sourav, Ritwika", room: "13013", type: "lab" },
    { id: "tue-2", day: "Tuesday", startTime: "11:30", endTime: "13:10", displayTime: "11:30–01:10", subject: "Cloud Computing", subjectCode: "CS502", faculty: "SD1", room: "13014", type: "theory" },
    { id: "tue-recess", day: "Tuesday", startTime: "13:10", endTime: "14:00", displayTime: "01:10–02:00", subject: "RECESS", faculty: "", room: "Campus Break", type: "recess" },
    { id: "tue-3", day: "Tuesday", startTime: "14:00", endTime: "14:50", displayTime: "02:00–02:50", subject: "OS", subjectCode: "CS503", faculty: "HB", room: "7009", type: "theory" },
    { id: "tue-4", day: "Tuesday", startTime: "14:50", endTime: "15:40", displayTime: "02:50–03:40", subject: "MATH", subjectCode: "MTH501", faculty: "AP", room: "7009", type: "theory" },
    { id: "tue-5", day: "Tuesday", startTime: "15:40", endTime: "17:20", displayTime: "03:40–05:20", subject: "OOP", subjectCode: "CS501", faculty: "HB", room: "7009", type: "theory" },

    // Wednesday
    { id: "wed-1", day: "Wednesday", startTime: "09:00", endTime: "11:30", displayTime: "09:00–11:30", subject: "Free Period", faculty: "", room: "", type: "free" },
    { id: "wed-2", day: "Wednesday", startTime: "11:30", endTime: "12:20", displayTime: "11:30–12:20", subject: "Pattern Recognition", subjectCode: "AIML503", faculty: "SC", room: "6002", type: "theory" },
    { id: "wed-3", day: "Wednesday", startTime: "12:20", endTime: "13:10", displayTime: "12:20–01:10", subject: "Intro to ML", subjectCode: "AIML501", faculty: "UKS", room: "LAB 13", type: "theory" },
    { id: "wed-recess", day: "Wednesday", startTime: "13:10", endTime: "14:00", displayTime: "01:10–02:00", subject: "RECESS", faculty: "", room: "Campus Break", type: "recess" },
    { id: "wed-4", day: "Wednesday", startTime: "14:00", endTime: "17:20", displayTime: "02:00–05:20", subject: "OS Lab", subjectCode: "CS503L", faculty: "SD, PM, Avik", room: "LAB 13", type: "lab" },

    // Thursday
    { id: "thu-1", day: "Thursday", startTime: "09:00", endTime: "13:10", displayTime: "09:00–01:10", subject: "Free Period", faculty: "", room: "", type: "free" },
    { id: "thu-recess", day: "Thursday", startTime: "13:10", endTime: "14:00", displayTime: "01:10–02:00", subject: "RECESS", faculty: "", room: "Campus Break", type: "recess" },
    { id: "thu-2", day: "Thursday", startTime: "14:00", endTime: "17:20", displayTime: "02:00–05:20", subject: "ML Lab", subjectCode: "AIML501L", faculty: "New Faculty 2, Avik, Sourav", room: "13013", type: "lab" },

    // Friday
    { id: "fri-1", day: "Friday", startTime: "09:00", endTime: "11:30", displayTime: "09:00–11:30", subject: "Free Period", faculty: "", room: "", type: "free" },
    { id: "fri-2", day: "Friday", startTime: "11:30", endTime: "13:10", displayTime: "11:30–01:10", subject: "OOP", subjectCode: "CS501", faculty: "HB", room: "LAB 13", type: "theory" },
    { id: "fri-recess", day: "Friday", startTime: "13:10", endTime: "14:00", displayTime: "01:10–02:00", subject: "RECESS", faculty: "", room: "Campus Break", type: "recess" },
    { id: "fri-3", day: "Friday", startTime: "14:00", endTime: "15:40", displayTime: "02:00–03:40", subject: "OS", subjectCode: "CS503", faculty: "SD", room: "LAB 13", type: "theory" },
    { id: "fri-4", day: "Friday", startTime: "15:40", endTime: "17:20", displayTime: "03:40–05:20", subject: "Cloud Computing", subjectCode: "CS502", faculty: "SD1", room: "LAB 13", type: "theory" }
  ],
  createdAt: 1727913600000,
  updatedAt: 1727913600000
};

function ensureFile(filePath: string, defaultContent = "[]") {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent);
  }
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  ensureFile(USERS_FILE, "[]");
  ensureFile(SESSIONS_FILE, "[]");
  ensureFile(ATTENDANCE_FILE, "[]");
  ensureFile(NOTIFICATIONS_FILE, "[]");
  ensureFile(PERFORMANCE_FILE, "[]");
  ensureFile(ASSIGNMENTS_FILE, "[]");
  ensureFile(SUBMISSIONS_FILE, "[]");
  ensureFile(MATERIALS_FILE, "[]");
  ensureFile(ANNOUNCEMENTS_FILE, "[]");
  ensureFile(LEAVE_REQUESTS_FILE, "[]");
  ensureFile(CORRECTIONS_FILE, "[]");
  ensureFile(SETTINGS_FILE, "[]");

  if (!fs.existsSync(TIMETABLES_FILE)) {
    fs.writeFileSync(TIMETABLES_FILE, JSON.stringify([DEFAULT_AIML_A_TIMETABLE], null, 2));
  }
}

export function readUsers(): UserRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}
export function writeUsers(users: UserRecord[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function readSessions(): SessionRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
}
export function writeSessions(sessions: SessionRecord[]) {
  ensureDataDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function readAttendance(): AttendanceLogRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, "utf8"));
}
export function writeAttendance(entries: AttendanceLogRecord[]) {
  ensureDataDir();
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(entries, null, 2));
}

export function readTimetables(): TimetableRecord[] {
  ensureDataDir();
  const raw = fs.readFileSync(TIMETABLES_FILE, "utf8");
  try {
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch (e) {
    // corrupted or empty
  }
  const initial = [DEFAULT_AIML_A_TIMETABLE];
  fs.writeFileSync(TIMETABLES_FILE, JSON.stringify(initial, null, 2));
  return initial;
}

export function writeTimetables(timetables: TimetableRecord[]) {
  ensureDataDir();
  fs.writeFileSync(TIMETABLES_FILE, JSON.stringify(timetables, null, 2));
}

// Notifications
export function readNotifications(): NotificationRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, "utf8"));
}
export function writeNotifications(notifications: NotificationRecord[]) {
  ensureDataDir();
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

// Performance
export function readPerformance(): PerformanceRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(PERFORMANCE_FILE, "utf8"));
}
export function writePerformance(records: PerformanceRecord[]) {
  ensureDataDir();
  fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify(records, null, 2));
}

// Assignments & Submissions
export function readAssignments(): AssignmentRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(ASSIGNMENTS_FILE, "utf8"));
}
export function writeAssignments(assignments: AssignmentRecord[]) {
  ensureDataDir();
  fs.writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
}

export function readSubmissions(): SubmissionRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8"));
}
export function writeSubmissions(submissions: SubmissionRecord[]) {
  ensureDataDir();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Materials
export function readMaterials(): MaterialRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(MATERIALS_FILE, "utf8"));
}
export function writeMaterials(materials: MaterialRecord[]) {
  ensureDataDir();
  fs.writeFileSync(MATERIALS_FILE, JSON.stringify(materials, null, 2));
}

// Announcements
export function readAnnouncements(): AnnouncementRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf8"));
}
export function writeAnnouncements(announcements: AnnouncementRecord[]) {
  ensureDataDir();
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
}

// Leave Requests
export function readLeaveRequests(): LeaveRequestRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(LEAVE_REQUESTS_FILE, "utf8"));
}
export function writeLeaveRequests(requests: LeaveRequestRecord[]) {
  ensureDataDir();
  fs.writeFileSync(LEAVE_REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

// Attendance Corrections
export function readAttendanceCorrections(): AttendanceCorrectionRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(CORRECTIONS_FILE, "utf8"));
}
export function writeAttendanceCorrections(corrections: AttendanceCorrectionRecord[]) {
  ensureDataDir();
  fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(corrections, null, 2));
}

// Settings
export function readSettings(): UserSettingsRecord[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
}
export function writeSettings(settings: UserSettingsRecord[]) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}


