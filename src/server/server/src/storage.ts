import fs from "fs";
import path from "path";
import { AttendanceLogRecord, SessionRecord, UserRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "[]");
  if (!fs.existsSync(ATTENDANCE_FILE)) fs.writeFileSync(ATTENDANCE_FILE, "[]");
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
