// C:\Users\SHIVAM\Desktop\Upasthiti-1\Upasthiti\src\server\server\src\types.ts
export type Role = 'student' | 'teacher' | 'admin';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatar?: string;
}

export interface SessionRecord {
  id: string;
  teacherId: string;
  department: string;
  subject: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  createdAt: number;
}

export interface AttendanceLogRecord {
  id: string;
  sessionId: string;
  studentId: string;
  method: 'manual' | 'qr' | 'face';
  timestamp: number;
}

export interface QrTokenPayload {
  sessionId: string;
  lat?: number;
  lng?: number;
  radius?: number; // meters
  exp: number; // epoch seconds
}