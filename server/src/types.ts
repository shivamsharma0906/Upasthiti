export type Role = "student" | "teacher" | "admin";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatar?: string;
  personalEmail?: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  program?: string;
  year?: string;
  semester?: string;
  section?: string;
  academicSession?: string;
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
  method: "manual" | "qr" | "face";
  timestamp: number;
}

export interface QrTokenPayload {
  sessionId: string;
  lat?: number;
  lng?: number;
  radius?: number; // meters
  exp: number; // epoch seconds
}

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TimetableClassType = 'theory' | 'lab' | 'tutorial' | 'recess' | 'free';

export interface TimetableClassEntry {
  id: string;
  day: TimetableDay;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  displayTime: string; // "09:00–10:40"
  subject: string;
  subjectCode?: string;
  faculty: string;
  room: string;
  type: TimetableClassType;
  label?: string;
}

export interface TimetableRecord {
  id: string;
  program: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  academicSession: string;
  classes: TimetableClassEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
  link?: string;
}

export interface SubjectMarksRecord {
  subjectCode: string;
  subjectName: string;
  internalMarks?: number;
  assignmentMarks?: number;
  examMarks?: number;
  totalMarks?: number;
  maxMarks?: number;
  grade?: string;
}

export interface PerformanceRecord {
  id: string;
  studentId: string;
  semester: string;
  academicSession: string;
  cgpa?: number;
  sgpa?: number;
  subjects: SubjectMarksRecord[];
  updatedAt: number;
}

export interface AssignmentRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  faculty: string;
  program: string;
  semester: string;
  section: string;
  createdDate: string;
  dueDate: string;
  points: number;
}

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  notes: string;
  fileUrl?: string;
  submittedAt: number;
  status: 'submitted' | 'graded';
  grade?: string;
}

export interface MaterialRecord {
  id: string;
  subject: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'zip' | 'document' | 'link';
  fileSize?: string;
  faculty: string;
  publicationDate: string;
  program: string;
  semester: string;
  section: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  author: string;
  authorRole: string;
  priority: 'urgent' | 'important' | 'general';
  category: string;
  program?: string;
  semester?: string;
  section?: string;
}

export interface LeaveRequestRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  type: 'Medical' | 'Academic' | 'Personal' | 'Other';
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: number;
  reviewedAt?: number;
  comments?: string;
}

export interface AttendanceCorrectionRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  sessionId: string;
  subject: string;
  sessionDate: string;
  reason: string;
  requestedStatus: 'Present';
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewerComments?: string;
}

export interface UserSettingsRecord {
  userId: string;
  emailNotifications: boolean;
  attendanceAlerts: boolean;
  assignmentReminders: boolean;
  announcementAlerts: boolean;
  theme?: 'system' | 'light' | 'dark';
  updatedAt: number;
}


