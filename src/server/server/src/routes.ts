import { Router, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // Only for type safety, functions imported from auth
import bcrypt from "bcryptjs";

import {
  AttendanceLogRecord,
  QrTokenPayload,
  SessionRecord,
  UserRecord,
  Role,
} from "./types";
import {
  readAttendance,
  readSessions,
  readUsers,
  writeAttendance,
  writeSessions,
  writeUsers,
} from "./storage";
import {
  signJwt,
  verifyJwt,
  hashPassword,
  comparePassword,
  requireAuth,
  AuthRequest,
} from "./auth";

// Augment the Express Request type to include user (if not already in auth.ts)
declare module "express" {
  interface Request {
    user?: Omit<UserRecord, "passwordHash">;
    headers: import("http").IncomingHttpHeaders;
  }
}

const router = Router();

// Health check
router.get("/health", (_req: Request, res) => res.json({ ok: true }));

// ======================= AUTH =======================

// Signup
router.post("/auth/signup", (req: Request, res) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: UserRecord["role"];
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = readUsers() || [];
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user: UserRecord = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    role,
    passwordHash: hashPassword(password),
  };

  users.push(user);
  writeUsers(users);

  const token = signJwt({ id: user.id });
  const { passwordHash, ...publicUser } = user;
  res.json({ token, user: publicUser });
});

// Login
router.post("/auth/login", (req: Request, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const users = readUsers() || [];
  const user = users.find((u) => u.email === email.toLowerCase());

  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signJwt({ id: user.id });
  const { passwordHash, ...publicUser } = user;
  res.json({ token, user: publicUser });
});

// Authenticated user details
router.get("/auth/me", requireAuth(), (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ user: req.user });
});

// ======================= SESSIONS =======================

// Teacher/Admin creates a session
router.post("/sessions", requireAuth(["teacher", "admin"]), (req: AuthRequest, res) => {
  const { department, subject, startTime, endTime, startDate, endDate } =
    req.body as Omit<SessionRecord, "id" | "createdAt" | "teacherId">;

  if (!department || !subject || !startTime || !endTime || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sessions = readSessions() || [];
  const session: SessionRecord = {
    id: uuidv4(),
    teacherId: req.user?.id || "",
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
router.get("/sessions", requireAuth(), (req: AuthRequest, res) => {
  res.json({ sessions: readSessions() || [] });
});

// Generate QR code token
router.post("/sessions/:id/qr", requireAuth(["teacher", "admin"]), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { lat, lng, radius } = req.body as {
    lat?: number;
    lng?: number;
    radius?: number;
  };

  const sessions = readSessions() || [];
  const session = sessions.find((s) => s.id === id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const expSeconds = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes expiry
  const payload: QrTokenPayload = { sessionId: id, exp: expSeconds };

  if (lat && lng && radius) {
    payload.lat = lat;
    payload.lng = lng;
    payload.radius = radius;
  }

  // Add id field to satisfy signJwt requirement
  const tokenPayload = { ...payload, id: session.id }; // Use session.id as id
  const token = signJwt(tokenPayload, 5 * 60);

  res.json({ token });
});

// ======================= ATTENDANCE =======================

// Student/Teacher/Admin scans QR
router.post(
  "/attendance/scan",
  requireAuth(["student", "teacher", "admin"]),
  (req: AuthRequest, res) => {
    const { token, currentLat, currentLng } = req.body as {
      token: string;
      currentLat?: number;
      currentLng?: number;
    };

    try {
      const payload = verifyJwt<QrTokenPayload>(token);
      if (!payload || !payload.sessionId) {
        return res.status(400).json({ error: "Invalid token payload" });
      }

      // Optional location check
      if (payload.lat && payload.lng && payload.radius) {
        if (typeof currentLat !== "number" || typeof currentLng !== "number") {
          return res.status(400).json({ error: "Location required" });
        }
        const distance = haversineMeters(payload.lat, payload.lng, currentLat, currentLng);
        if (distance > payload.radius) return res.status(403).json({ error: "Out of range" });
      }

      const logs = readAttendance() || [];
      const entry: AttendanceLogRecord = {
        id: uuidv4(),
        sessionId: payload.sessionId,
        studentId: req.user?.id || "",
        method: "qr",
        timestamp: Date.now(),
      };
      logs.push(entry);
      writeAttendance(logs);

      res.json({ ok: true, entry });
    } catch (error) {
      return res.status(401).json({
        error: "Token verification failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Teacher/Admin view attendance
router.get("/attendance", requireAuth(["teacher", "admin"]), (req: AuthRequest, res) => {
  res.json({ attendance: readAttendance() || [] });
});

// ======================= UTILS =======================
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;