import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

import {
  AttendanceLogRecord,
  QrTokenPayload,
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
  UserSettingsRecord,
} from "./types";
import {
  readAttendance,
  readSessions,
  readTimetables,
  readUsers,
  writeAttendance,
  writeSessions,
  writeTimetables,
  writeUsers,
  readNotifications,
  writeNotifications,
  readPerformance,
  writePerformance,
  readAssignments,
  writeAssignments,
  readSubmissions,
  writeSubmissions,
  readMaterials,
  writeMaterials,
  readAnnouncements,
  writeAnnouncements,
  readLeaveRequests,
  writeLeaveRequests,
  readAttendanceCorrections,
  writeAttendanceCorrections,
  readSettings,
  writeSettings,
} from "./storage";
import {
  comparePassword,
  hashPassword,
  requireAuth,
  signJwt,
  verifyJwt,
} from "./auth";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// ======================= AUTH =======================

// Signup
router.post("/auth/signup", (req, res) => {
  const { name, email, password, role, personalEmail, phone, avatar } = req.body as {
    name: string;
    email: string;
    password: string;
    role: UserRecord["role"];
    personalEmail?: string;
    phone?: string;
    avatar?: string;
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user: UserRecord = {
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    passwordHash: hashPassword(password),
    personalEmail: personalEmail?.trim() || undefined,
    phone: phone?.trim() || undefined,
    avatar: avatar?.trim() || undefined,
    // Academic fields are explicitly left unassigned at signup
  };

  users.push(user);
  writeUsers(users);

  const token = signJwt({ id: user.id });
  const { passwordHash, ...publicUser } = user;
  res.json({ token, user: publicUser });
});

// Login
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const users = readUsers();
  const user = users.find((u) => u.email === email.toLowerCase());

  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signJwt({ id: user.id });
  const { passwordHash, ...publicUser } = user;
  res.json({ token, user: publicUser });
});

// Authenticated user details
router.get("/auth/me", requireAuth(), (req, res) => {
  res.json({ user: (req as any).user });
});

// Update Profile (Student Profile Completion)
router.put("/auth/profile", requireAuth(), (req, res) => {
  const authUser = (req as any).user;
  const users = readUsers();
  const index = users.findIndex((u) => u.id === authUser.id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const {
    name,
    personalEmail,
    phone,
    avatar,
    rollNumber,
    department,
    program,
    year,
    semester,
    section,
    academicSession,
  } = req.body;

  const target = users[index];

  // If student, validate required academic fields
  if (target.role === "student") {
    if (
      !rollNumber?.trim() ||
      !department?.trim() ||
      !program?.trim() ||
      !year?.trim() ||
      !semester?.trim() ||
      !section?.trim() ||
      !academicSession?.trim()
    ) {
      return res.status(400).json({ 
        error: "All required academic fields (roll number, department, program, year, semester, section, session) must be completed." 
      });
    }
  }

  if (name?.trim()) target.name = name.trim();
  if (personalEmail !== undefined) target.personalEmail = personalEmail ? personalEmail.trim() : undefined;
  if (phone !== undefined) target.phone = phone ? phone.trim() : undefined;
  if (avatar !== undefined) target.avatar = avatar ? avatar.trim() : undefined;

  if (rollNumber?.trim()) target.rollNumber = rollNumber.trim();
  if (department?.trim()) target.department = department.trim();
  if (program?.trim()) target.program = program.trim();
  if (year?.trim()) target.year = year.trim();
  if (semester?.trim()) target.semester = semester.trim();
  if (section?.trim()) target.section = section.trim();
  if (academicSession?.trim()) target.academicSession = academicSession.trim();

  writeUsers(users);

  const { passwordHash, ...publicUser } = target;
  res.json({ user: publicUser });
});

// ======================= SESSIONS =======================

// Teacher/Admin creates a session
router.post("/sessions", requireAuth(["teacher", "admin"]), (req, res) => {
  const { department, subject, startTime, endTime, startDate, endDate } =
    req.body as Omit<
      SessionRecord,
      "id" | "createdAt" | "teacherId"
    >;

  if (!department || !subject || !startTime || !endTime || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sessions = readSessions();
  const session: SessionRecord = {
    id: uuidv4(),
    teacherId: (req as any).user.id,
    department,
    subject,
    startTime,
    endTime,
    startDate,
    endDate,
    createdAt: Date.now(),
  };

  sessions.push(session);
  writeSessions(sessions);
  res.json({ session });
});

// List all sessions
router.get("/sessions", requireAuth(), (_req, res) => {
  res.json({ sessions: readSessions() });
});

// Generate QR code token
router.post("/sessions/:id/qr", requireAuth(["teacher", "admin"]), (req, res) => {
  const { id } = req.params;
  const { lat, lng, radius } = req.body as {
    lat?: number;
    lng?: number;
    radius?: number;
  };

  const sessions = readSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const payload: any = { sessionId: id };

  if (lat && lng && radius) {
    payload.lat = lat;
    payload.lng = lng;
    payload.radius = radius;
  }

  const token = signJwt(payload, 5 * 60);
  res.json({ token });
});

// ======================= ATTENDANCE =======================

// Student/Teacher/Admin scans QR
router.post(
  "/attendance/scan",
  requireAuth(["student", "teacher", "admin"]),
  (req, res) => {
    const { token, currentLat, currentLng } = req.body as {
      token: string;
      currentLat?: number;
      currentLng?: number;
    };

    const payload = verifyJwt<QrTokenPayload>(token);
    if (!payload) return res.status(400).json({ error: "Invalid or expired QR" });

    // Optional location check
    if (payload.lat && payload.lng && payload.radius) {
      if (typeof currentLat !== "number" || typeof currentLng !== "number") {
        return res.status(400).json({ error: "Location required" });
      }
      const distance = haversineMeters(
        payload.lat,
        payload.lng,
        currentLat,
        currentLng
      );
      if (distance > payload.radius)
        return res.status(403).json({ error: "Out of range" });
    }

    const logs = readAttendance();
    const entry: AttendanceLogRecord = {
      id: uuidv4(),
      sessionId: payload.sessionId,
      studentId: (req as any).user.id,
      method: "qr",
      timestamp: Date.now(),
    };
    logs.push(entry);
    writeAttendance(logs);

    res.json({ ok: true, entry });
  }
);

// View attendance logs
router.get("/attendance", requireAuth(), (req, res) => {
  const user = (req as any).user;
  const logs = readAttendance();
  if (user.role === "student") {
    return res.json({ attendance: logs.filter((l) => l.studentId === user.id) });
  }
  res.json({ attendance: logs });
});

// List users (for teachers/admins)
router.get("/users", requireAuth(["teacher", "admin"]), (_req, res) => {
  const users = readUsers().map(({ passwordHash, ...u }) => u);
  res.json({ users });
});

// ======================= TIMETABLES =======================

function normalizeAcademicKey(program = "", year = "", semester = "", section = "", session = "") {
  const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${norm(program)}_${norm(year)}_${norm(semester)}_${norm(section)}_${norm(session)}`;
}

// Get all timetables (authenticated users)
router.get("/timetables", requireAuth(["student", "teacher", "admin"]), (_req, res) => {
  const timetables = readTimetables();
  res.json({ timetables });
});

// Match a timetable for an academic profile
router.get("/timetables/match", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const { program, year, semester, section, academicSession } = req.query as {
    program?: string;
    year?: string;
    semester?: string;
    section?: string;
    academicSession?: string;
  };

  const timetables = readTimetables();

  // Try exact key match first
  if (program && semester && section) {
    const targetKey = normalizeAcademicKey(
      program,
      year || "",
      semester,
      section,
      academicSession || ""
    );

    const exact = timetables.find((t) =>
      normalizeAcademicKey(t.program, t.year, t.semester, t.section, t.academicSession) === targetKey
    );
    if (exact) return res.json({ timetable: exact, matchType: "exact" });

    // Try flexible match (program + semester + section)
    const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const flex = timetables.find(
      (t) =>
        (norm(t.program).includes(norm(program)) || norm(program).includes(norm(t.program))) &&
        (norm(t.semester).includes(norm(semester)) || norm(semester).includes(norm(t.semester))) &&
        (norm(t.section).includes(norm(section)) || norm(section).includes(norm(t.section)))
    );
    if (flex) return res.json({ timetable: flex, matchType: "flexible" });
  }

  // Fallback to default AIML A routine
  const fallback = timetables[0] || null;
  res.json({ timetable: fallback, matchType: "fallback" });
});

// Create timetable (Admin only)
router.post("/timetables", requireAuth(["admin"]), (req, res) => {
  const { program, department, year, semester, section, academicSession, classes } = req.body as {
    program: string;
    department: string;
    year: string;
    semester: string;
    section: string;
    academicSession: string;
    classes: any[];
  };

  if (!program?.trim() || !semester?.trim() || !section?.trim()) {
    return res.status(400).json({ error: "Program, Semester, and Section are required." });
  }

  const timetables = readTimetables();
  const targetKey = normalizeAcademicKey(program, year, semester, section, academicSession);

  // Prevent accidental duplicate active timetables for exact same combination
  const duplicate = timetables.find(
    (t) => normalizeAcademicKey(t.program, t.year, t.semester, t.section, t.academicSession) === targetKey
  );

  if (duplicate) {
    return res.status(409).json({
      error: `A timetable already exists for ${program} • ${semester} • Section ${section} (${academicSession}). Please edit the existing timetable instead of creating a duplicate.`,
      existingId: duplicate.id,
    });
  }

  const newTimetable: TimetableRecord = {
    id: uuidv4(),
    program: program.trim(),
    department: department?.trim() || "",
    year: year?.trim() || "",
    semester: semester.trim(),
    section: section.trim(),
    academicSession: academicSession?.trim() || "2024-2025",
    classes: Array.isArray(classes) ? classes : [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  timetables.push(newTimetable);
  writeTimetables(timetables);

  res.status(201).json({ ok: true, timetable: newTimetable });
});

// Update timetable (Admin only)
router.put("/timetables/:id", requireAuth(["admin"]), (req, res) => {
  const { id } = req.params;
  const { program, department, year, semester, section, academicSession, classes } = req.body;

  const timetables = readTimetables();
  const index = timetables.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Timetable not found." });
  }

  // Check if academic combination collides with another timetable
  if (program && semester && section) {
    const targetKey = normalizeAcademicKey(program, year, semester, section, academicSession);
    const conflict = timetables.find(
      (t) =>
        t.id !== id &&
        normalizeAcademicKey(t.program, t.year, t.semester, t.section, t.academicSession) === targetKey
    );
    if (conflict) {
      return res.status(409).json({
        error: `Another timetable already exists for ${program} • ${semester} • Section ${section} (${academicSession}).`,
      });
    }
  }

  const existing = timetables[index];
  const updated: TimetableRecord = {
    ...existing,
    program: program?.trim() || existing.program,
    department: department !== undefined ? department.trim() : existing.department,
    year: year !== undefined ? year.trim() : existing.year,
    semester: semester?.trim() || existing.semester,
    section: section?.trim() || existing.section,
    academicSession: academicSession?.trim() || existing.academicSession,
    classes: Array.isArray(classes) ? classes : existing.classes,
    updatedAt: Date.now(),
  };

  timetables[index] = updated;
  writeTimetables(timetables);

  res.json({ ok: true, timetable: updated });
});

// Delete timetable (Admin only)
router.delete("/timetables/:id", requireAuth(["admin"]), (req, res) => {
  const { id } = req.params;
  const timetables = readTimetables();
  const index = timetables.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Timetable not found." });
  }

  // Prevent deleting the last remaining timetable if desired, or allow delete
  if (timetables.length <= 1) {
    return res.status(400).json({ error: "Cannot delete the sole active timetable in the institution." });
  }

  timetables.splice(index, 1);
  writeTimetables(timetables);

  res.json({ ok: true });
});

// ======================= NOTIFICATIONS =======================
router.get("/notifications", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const notifications = readNotifications()
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.timestamp - a.timestamp);
  res.json({ notifications });
});

router.put("/notifications/:id/read", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const notifications = readNotifications();
  const index = notifications.findIndex((n) => n.id === id && n.userId === user.id);
  if (index !== -1) {
    notifications[index].isRead = true;
    writeNotifications(notifications);
  }
  res.json({ ok: true });
});

router.put("/notifications/read-all", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const notifications = readNotifications().map((n) => {
    if (n.userId === user.id) return { ...n, isRead: true };
    return n;
  });
  writeNotifications(notifications);
  res.json({ ok: true });
});

// ======================= PERFORMANCE =======================
router.get("/performance", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const records = readPerformance();
  const record = records.find((p) => p.studentId === user.id);
  res.json({ performance: record || null });
});

// ======================= ASSIGNMENTS =======================
router.get("/assignments", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const assignments = readAssignments();
  const submissions = readSubmissions().filter((s) => s.studentId === user.id);

  // Filter assignments matching student's program/semester/section if defined
  const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const studentProg = norm(user.program);
  const studentSem = norm(user.semester);
  const studentSec = norm(user.section);

  const relevant = assignments.filter((a) => {
    if (!a.program && !a.semester && !a.section) return true; // general
    const matchProg = !a.program || norm(a.program).includes(studentProg) || studentProg.includes(norm(a.program));
    const matchSem = !a.semester || norm(a.semester).includes(studentSem) || studentSem.includes(norm(a.semester));
    const matchSec = !a.section || norm(a.section).includes(studentSec) || studentSec.includes(norm(a.section));
    return matchProg && matchSem && matchSec;
  });

  // Attach submission info
  const result = relevant.map((a) => {
    const submission = submissions.find((s) => s.assignmentId === a.id);
    return {
      ...a,
      submission: submission || null,
      status: submission ? (submission.grade ? "graded" : "submitted") : "pending",
    };
  });

  res.json({ assignments: result });
});

router.post("/assignments/:id/submit", requireAuth(["student"]), (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { notes, fileUrl } = req.body as { notes: string; fileUrl?: string };

  const assignments = readAssignments();
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) return res.status(404).json({ error: "Assignment not found" });

  const submissions = readSubmissions();
  const existingIdx = submissions.findIndex((s) => s.assignmentId === id && s.studentId === user.id);

  const entry: SubmissionRecord = {
    id: existingIdx !== -1 ? submissions[existingIdx].id : uuidv4(),
    assignmentId: id,
    studentId: user.id,
    studentName: user.name,
    notes: notes?.trim() || "",
    fileUrl: fileUrl?.trim() || undefined,
    submittedAt: Date.now(),
    status: "submitted",
  };

  if (existingIdx !== -1) {
    submissions[existingIdx] = entry;
  } else {
    submissions.push(entry);
  }
  writeSubmissions(submissions);

  res.json({ ok: true, submission: entry });
});

// ======================= MATERIALS =======================
router.get("/materials", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const materials = readMaterials();

  const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const studentProg = norm(user.program);
  const studentSem = norm(user.semester);
  const studentSec = norm(user.section);

  const relevant = materials.filter((m) => {
    if (!m.program && !m.semester && !m.section) return true;
    const matchProg = !m.program || norm(m.program).includes(studentProg) || studentProg.includes(norm(m.program));
    const matchSem = !m.semester || norm(m.semester).includes(studentSem) || studentSem.includes(norm(m.semester));
    const matchSec = !m.section || norm(m.section).includes(studentSec) || studentSec.includes(norm(m.section));
    return matchProg && matchSem && matchSec;
  });

  res.json({ materials: relevant });
});

// ======================= ANNOUNCEMENTS =======================
router.get("/announcements", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const announcements = readAnnouncements();

  const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const studentProg = norm(user.program);
  const studentSem = norm(user.semester);
  const studentSec = norm(user.section);

  const relevant = announcements.filter((a) => {
    if (!a.program && !a.semester && !a.section) return true;
    const matchProg = !a.program || norm(a.program).includes(studentProg) || studentProg.includes(norm(a.program));
    const matchSem = !a.semester || norm(a.semester).includes(studentSem) || studentSem.includes(norm(a.semester));
    const matchSec = !a.section || norm(a.section).includes(studentSec) || studentSec.includes(norm(a.section));
    return matchProg && matchSem && matchSec;
  });

  res.json({ announcements: relevant });
});

// ======================= LEAVE REQUESTS =======================
router.get("/leave-requests", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const requests = readLeaveRequests();
  if (user.role === "student") {
    return res.json({ requests: requests.filter((r) => r.studentId === user.id) });
  }
  res.json({ requests });
});

router.post("/leave-requests", requireAuth(["student"]), (req, res) => {
  const user = (req as any).user;
  const { startDate, endDate, reason, type, attachmentUrl } = req.body as {
    startDate: string;
    endDate: string;
    reason: string;
    type: LeaveRequestRecord["type"];
    attachmentUrl?: string;
  };

  if (!startDate || !endDate || !reason?.trim()) {
    return res.status(400).json({ error: "Start date, end date, and reason are required." });
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const newRequest: LeaveRequestRecord = {
    id: uuidv4(),
    studentId: user.id,
    studentName: user.name,
    rollNumber: user.rollNumber,
    startDate,
    endDate,
    daysCount: diffDays,
    reason: reason.trim(),
    type: type || "Personal",
    attachmentUrl: attachmentUrl?.trim() || undefined,
    status: "Pending",
    submittedAt: Date.now(),
  };

  const requests = readLeaveRequests();
  requests.push(newRequest);
  writeLeaveRequests(requests);

  res.status(201).json({ ok: true, request: newRequest });
});

// ======================= ATTENDANCE CORRECTIONS =======================
router.get("/attendance-corrections", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const corrections = readAttendanceCorrections();
  if (user.role === "student") {
    return res.json({ corrections: corrections.filter((c) => c.studentId === user.id) });
  }
  res.json({ corrections });
});

router.post("/attendance-corrections", requireAuth(["student"]), (req, res) => {
  const user = (req as any).user;
  const { sessionId, subject, sessionDate, reason } = req.body as {
    sessionId: string;
    subject: string;
    sessionDate: string;
    reason: string;
  };

  if (!subject?.trim() || !sessionDate || !reason?.trim()) {
    return res.status(400).json({ error: "Subject, session date, and reason are required." });
  }

  const newCorrection: AttendanceCorrectionRecord = {
    id: uuidv4(),
    studentId: user.id,
    studentName: user.name,
    rollNumber: user.rollNumber,
    sessionId: sessionId || "unspecified",
    subject: subject.trim(),
    sessionDate,
    reason: reason.trim(),
    requestedStatus: "Present",
    status: "Pending",
    submittedAt: Date.now(),
  };

  const corrections = readAttendanceCorrections();
  corrections.push(newCorrection);
  writeAttendanceCorrections(corrections);

  res.status(201).json({ ok: true, correction: newCorrection });
});

// ======================= SETTINGS & PASSWORD CHANGE =======================
router.get("/settings", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const settingsList = readSettings();
  const userSettings = settingsList.find((s) => s.userId === user.id) || {
    userId: user.id,
    emailNotifications: true,
    attendanceAlerts: true,
    assignmentReminders: true,
    announcementAlerts: true,
    theme: "system",
    updatedAt: Date.now(),
  };
  res.json({ settings: userSettings });
});

router.put("/settings", requireAuth(["student", "teacher", "admin"]), (req, res) => {
  const user = (req as any).user;
  const { emailNotifications, attendanceAlerts, assignmentReminders, announcementAlerts, theme } = req.body;

  const settingsList = readSettings();
  const index = settingsList.findIndex((s) => s.userId === user.id);

  const updated: UserSettingsRecord = {
    userId: user.id,
    emailNotifications: Boolean(emailNotifications),
    attendanceAlerts: Boolean(attendanceAlerts),
    assignmentReminders: Boolean(assignmentReminders),
    announcementAlerts: Boolean(announcementAlerts),
    theme: theme || "system",
    updatedAt: Date.now(),
  };

  if (index !== -1) {
    settingsList[index] = updated;
  } else {
    settingsList.push(updated);
  }
  writeSettings(settingsList);

  res.json({ ok: true, settings: updated });
});

router.put("/auth/change-password", requireAuth(), (req, res) => {
  const authUser = (req as any).user;
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const users = readUsers();
  const user = users.find((u) => u.id === authUser.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!comparePassword(currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: "Current password does not match institutional records." });
  }

  user.passwordHash = hashPassword(newPassword);
  writeUsers(users);

  res.json({ ok: true, message: "Password updated successfully." });
});

// ======================= UTILS =======================
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
