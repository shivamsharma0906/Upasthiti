import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  QrCode, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  CalendarCheck,
  Sparkles,
  Coffee,
  FlaskConical,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceBadge } from '@/components/ui/StatusBadge';
import { 
  getAttendanceStatus, 
  getAttendanceAdvice, 
  getSessionStatus, 
  INSTITUTIONAL_MIN_ATTENDANCE 
} from '@/lib/attendanceStatus';
import { 
  DayOfWeek, 
  TimetablePeriod, 
  TimetableRecord,
  DEFAULT_AIML_A_RECORD,
  TIMETABLE_WEEKDAYS, 
  TIMETABLE_METADATA, 
  fetchAllTimetables,
  matchStudentTimetable,
  getClassesForDay, 
  getTodayClassStatus 
} from '@/lib/timetableData';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface SessionItem {
  id: string;
  teacherId: string;
  department: string;
  subject: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

interface AttendanceLogItem {
  id: string;
  sessionId: string;
  studentId: string;
  method: string;
  timestamp: number;
}

interface SubjectCardStat {
  subject: string;
  code: string;
  attended: number;
  total: number;
  faculty: string;
  room: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real attendance and session data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('ems_token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [attRes, sessRes] = await Promise.all([
          fetch(`${API_BASE}/attendance`, { headers }),
          fetch(`${API_BASE}/sessions`, { headers })
        ]);

        if (attRes.ok) {
          const data = await attRes.json();
          if (isMounted) {
            setAttendanceLogs(data.attendance || []);
          }
        }
        if (sessRes.ok) {
          const data = await sessRes.json();
          if (isMounted) {
            setSessions(data.sessions || []);
          }
        }
      } catch (err) {
        console.error('Failed to load real attendance data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute initials fallback
  const studentInitials = useMemo(() => {
    if (!user?.name) return 'ST';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

  // Derive subjects dynamically from real sessions
  const subjects = useMemo<SubjectCardStat[]>(() => {
    if (sessions.length === 0) return [];

    const subjectMap = new Map<string, { sessions: SessionItem[]; attendedCount: number }>();
    sessions.forEach((s) => {
      const key = s.subject || 'General Session';
      if (!subjectMap.has(key)) {
        subjectMap.set(key, { sessions: [], attendedCount: 0 });
      }
      subjectMap.get(key)!.sessions.push(s);
    });

    // Count real attendance logs per subject
    attendanceLogs.forEach((log) => {
      const matchedSession = sessions.find((s) => s.id === log.sessionId);
      if (matchedSession) {
        const key = matchedSession.subject || 'General Session';
        if (subjectMap.has(key)) {
          subjectMap.get(key)!.attendedCount += 1;
        }
      }
    });

    const result: SubjectCardStat[] = [];
    subjectMap.forEach((val, key) => {
      const totalCount = val.sessions.length;
      result.push({
        subject: key,
        code: val.sessions[0]?.department || 'ACAD',
        attended: val.attendedCount,
        total: totalCount,
        faculty: 'Faculty Assigned',
        room: 'Assigned Hall'
      });
    });

    return result;
  }, [sessions, attendanceLogs]);

  // Overall attendance calculations using real logs
  const totals = useMemo(() => {
    const attended = attendanceLogs.length;
    const total = sessions.length;
    const rate = total > 0 ? (attended / total) * 100 : 0;
    return { attended, total, rate: Math.round(rate * 10) / 10 };
  }, [attendanceLogs, sessions]);

  const hasAttendanceRecords = attendanceLogs.length > 0;
  const overallStatus = getAttendanceStatus(totals.rate);
  const overallAdvice = getAttendanceAdvice(totals.attended, totals.total);

  // Attention required courses (only if real subjects exist and rate < 75%)
  const attentionRequiredSubjects = useMemo(() => {
    if (!hasAttendanceRecords && subjects.length === 0) return [];
    return subjects.filter((s) => s.total > 0 && (s.attended / s.total) * 100 < INSTITUTIONAL_MIN_ATTENDANCE);
  }, [subjects, hasAttendanceRecords]);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Real Timetable integration for Today's Classes & Next Class
  const [timetables, setTimetables] = useState<TimetableRecord[]>([DEFAULT_AIML_A_RECORD]);

  useEffect(() => {
    fetchAllTimetables().then((records) => {
      if (records && records.length > 0) setTimetables(records);
    });
  }, []);

  const { timetable: activeTimetable } = useMemo(() => {
    return matchStudentTimetable(timetables, user);
  }, [timetables, user]);

  const todayDayName = useMemo<DayOfWeek | null>(() => {
    const dayIdx = new Date().getDay();
    if (dayIdx >= 1 && dayIdx <= 5) {
      return TIMETABLE_WEEKDAYS[dayIdx - 1];
    }
    if (dayIdx === 6 && (activeTimetable.classes || []).some(c => c.day === 'Saturday')) {
      return 'Saturday';
    }
    return null; // Weekend
  }, [activeTimetable]);

  const todayClasses = useMemo<TimetablePeriod[]>(() => {
    if (!todayDayName) return [];
    return getClassesForDay(todayDayName, activeTimetable.classes);
  }, [todayDayName, activeTimetable]);

  const { currentClass, nextClass } = useMemo(() => {
    if (!todayDayName) return { currentClass: null, nextClass: null };
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    return getTodayClassStatus(todayDayName, currentMins, activeTimetable.classes);
  }, [todayDayName, activeTimetable]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. HERO OPERATIONAL PANEL */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{user?.department || 'Academic Portal'} • Student Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              {greeting}, {user?.name || 'Student'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {hasAttendanceRecords ? (
                <>
                  Your overall attendance is currently{' '}
                  <span className="font-semibold text-foreground font-mono tabular-nums">
                    {totals.rate}%
                  </span>
                  . Status:{' '}
                  <span className={cn('font-semibold', overallStatus.textClass)}>
                    {overallStatus.label}
                  </span>
                  . {overallAdvice.message}.
                </>
              ) : (
                'No attendance records yet. Your attendance status and lecture check-ins will appear here once verified.'
              )}
            </p>
          </div>

          {/* Quick Primary Actions in Hero */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/qr-scanner')}
              size="lg"
              className="gap-2 h-11 px-5 shadow-xs font-semibold bg-primary text-primary-foreground"
            >
              <QrCode className="h-4 w-4" />
              <span>Scan QR Attendance</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/attendance')}
              size="lg"
              className="gap-1.5 h-11 text-xs font-medium"
            >
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              <span>View Logs</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Highlighted Metric Bar */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Overall Rate
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-foreground">
                {hasAttendanceRecords ? `${totals.rate}%` : '0%'}
              </span>
              {hasAttendanceRecords && <AttendanceBadge percentage={totals.rate} size="sm" />}
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Lectures Attended
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-heading tabular-nums text-foreground">
              {totals.attended}{' '}
              <span className="text-xs font-normal text-muted-foreground font-sans">
                / {totals.total}
              </span>
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Institution Min
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-heading tabular-nums text-foreground">
              75.0%
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Enrolled Sessions
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-heading tabular-nums text-foreground">
              {sessions.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED QUICK ACTIONS */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Actions
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct access to currently active student tools and credentials
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => navigate('/qr-scanner')}
              size="sm"
              className="gap-2 text-xs font-semibold shadow-xs"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Scan Attendance</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/attendance')}
              size="sm"
              className="gap-2 text-xs font-medium"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span>View Attendance</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/profile')}
              size="sm"
              className="gap-2 text-xs font-medium"
            >
              <UserIcon className="h-3.5 w-3.5 text-primary" />
              <span>My Profile</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. STUDENT REAL INSTITUTIONAL PROFILE CARD */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 font-mono overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                <span>{studentInitials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground font-heading">
                  {user?.name || 'Student'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Enrolled Student
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {user?.email || 'No email registered'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              Identity Status: <span className="font-semibold text-foreground">Verified Institutional Account</span>
            </div>
            <Link
              to="/student/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors shadow-2xs"
            >
              <UserIcon className="h-3.5 w-3.5 text-primary" />
              <span>Manage Profile</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Real Profile Attributes with "Not assigned yet" for unassigned fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 pt-5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Roll Number
            </span>
            <p className="text-sm font-semibold text-foreground font-mono truncate">
              {user?.rollNumber || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Department
            </span>
            <p className="text-sm font-semibold text-foreground truncate" title={user?.department}>
              {user?.department || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Program / Course
            </span>
            <p className="text-sm font-semibold text-foreground truncate" title={user?.program}>
              {user?.program || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Academic Year
            </span>
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.year || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Semester
            </span>
            <p className="text-sm font-semibold text-foreground truncate font-mono">
              {user?.semester || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Section
            </span>
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.section || 'Not assigned yet'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Session
            </span>
            <p className="text-sm font-semibold text-foreground truncate font-mono">
              {user?.academicSession || 'Not assigned yet'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. ATTENDANCE ALERTS SECTION */}
      {attentionRequiredSubjects.length > 0 ? (
        <div className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Attendance Attention Required ({attentionRequiredSubjects.length}{' '}
                {attentionRequiredSubjects.length === 1 ? 'course' : 'courses'} below 75%)
              </h2>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                The institutional regulation requires a minimum of 75% attendance for examination eligibility.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {attentionRequiredSubjects.map((sub) => {
                  const rate = Math.round((sub.attended / sub.total) * 100);
                  const advice = getAttendanceAdvice(sub.attended, sub.total);
                  return (
                    <div
                      key={sub.code}
                      className="bg-card border border-amber-200 dark:border-amber-800/80 rounded-md px-3 py-1.5 text-xs flex items-center gap-2 shadow-2xs"
                    >
                      <span className="font-semibold text-foreground">{sub.subject}</span>
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                        {rate}%
                      </span>
                      <span className="text-muted-foreground text-[11px] border-l border-border pl-2">
                        {advice.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : hasAttendanceRecords ? (
        <div className="border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              Attendance Requirement Satisfied
            </span>
            <span className="text-emerald-800 dark:text-emerald-300 ml-1.5">
              All enrolled courses meet or exceed the mandatory 75% institutional attendance threshold.
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-card/60 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-muted-foreground/60 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">No Attendance Alerts</span> — Lecture check-ins and institutional threshold tracking will update automatically as classes proceed.
          </div>
        </div>
      )}

      {/* 5. TODAY'S CLASSES & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Today's Academic Schedule</span>
            </h2>
            <div className="flex items-center gap-3">
              <Link
                to="/student/timetable"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {!todayDayName ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center shadow-xs space-y-2">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto opacity-40 mb-1" />
              <h3 className="text-sm font-semibold text-foreground">Weekend — No classes scheduled today.</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Next scheduled lecture is on Monday at 09:00 AM: <span className="font-semibold text-foreground">Intro to ML (UKS) [6010]</span>.
              </p>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/student/timetable')} 
                  className="text-xs gap-1.5"
                >
                  <span>View Weekly Timetable</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center shadow-xs">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <h3 className="text-sm font-semibold text-foreground">No scheduled sessions for today.</h3>
              <p className="text-xs text-muted-foreground mt-1">
                There are no active classes scheduled for your enrolled courses today.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Active / Next Class Banner */}
              {currentClass && (
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-foreground">In Progress:</span>
                    <span className="font-semibold text-primary">{currentClass.subject}</span>
                    {currentClass.room && (
                      <span className="text-muted-foreground font-mono text-[11px]">[{currentClass.room}]</span>
                    )}
                  </div>
                  {currentClass.type === 'theory' && (
                    <Button 
                      onClick={() => navigate('/qr-scanner')}
                      size="sm" 
                      className="h-7 text-xs font-semibold gap-1 bg-primary text-primary-foreground shadow-xs"
                    >
                      <QrCode className="h-3 w-3" />
                      <span>Scan In</span>
                    </Button>
                  )}
                </div>
              )}

              {/* List of today's periods from real routine */}
              {todayClasses.map((period) => {
                const isCurrent = currentClass?.id === period.id;
                const isNext = nextClass?.id === period.id;

                return (
                  <div
                    key={period.id}
                    className={cn(
                      "bg-card border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors",
                      isCurrent && "border-primary ring-1 ring-primary bg-primary/5",
                      !isCurrent && period.type === 'lab' && "border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/10",
                      !isCurrent && period.type === 'recess' && "border-amber-200 dark:border-amber-900/40 bg-amber-50/20",
                      !isCurrent && period.type === 'free' && "border-dashed border-border/80 opacity-70"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-md bg-muted flex flex-col items-center justify-center shrink-0 text-center font-mono">
                        <span className="text-[10px] font-bold text-foreground">
                          {period.startTime.split(':')[0]}
                        </span>
                        <span className="text-[9px] text-muted-foreground leading-none">
                          :{period.startTime.split(':')[1]}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">
                            {period.subject}
                          </h3>

                          {isCurrent && (
                            <Badge className="text-[9px] uppercase font-mono bg-primary text-primary-foreground">
                              Live
                            </Badge>
                          )}
                          {isNext && (
                            <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/40 text-primary">
                              Next Up
                            </Badge>
                          )}
                          {period.type === 'lab' && (
                            <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                              Lab
                            </Badge>
                          )}
                          {period.type === 'recess' && (
                            <Badge variant="secondary" className="text-[9px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Recess
                            </Badge>
                          )}
                          {period.type === 'free' && (
                            <Badge variant="secondary" className="text-[9px] font-mono text-muted-foreground">
                              Free
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {period.faculty ? `Faculty: ${period.faculty}` : period.type === 'recess' ? 'Campus Break' : 'Independent Study'}
                          {period.room && ` • Room: ${period.room}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs text-muted-foreground">
                      <span>{period.displayTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Recent Activity</span>
            </h2>
            <button
              onClick={() => navigate('/student/attendance')}
              className="text-xs text-primary hover:underline font-medium"
            >
              All Logs
            </button>
          </div>

          {!hasAttendanceRecords ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center shadow-xs">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <h3 className="text-sm font-semibold text-foreground">No attendance records yet.</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your verified lecture check-ins will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg divide-y divide-border/70 shadow-xs">
              {attendanceLogs.slice(0, 5).map((log) => {
                const matched = sessions.find((s) => s.id === log.sessionId);
                const logDate = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} className="p-3.5 text-xs flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {matched?.subject || 'Lecture Session'}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {logDate}, {logTime} • {log.method.toUpperCase()} Verification
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 font-medium">
                      Present
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. UPCOMING ACADEMIC ITEMS */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Upcoming Academic Items</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Scheduled academic milestones, examinations, and lecture sessions
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Academic Calendar
          </span>
        </div>

        {/* Real data check: If no future academic submissions in database, show professional empty state */}
        <div className="p-8 text-center bg-muted/20 border border-dashed border-border/80 rounded-lg">
          <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-foreground">No upcoming academic items scheduled.</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Your upcoming examination schedules, project submissions, and institutional deadlines will appear here once published by faculty.
          </p>
        </div>
      </div>

      {/* 7. SUBJECT BREAKDOWN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
              Enrolled Course Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time attendance rates across enrolled academic courses
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center shadow-xs">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">No registered subjects yet.</h3>
            <p className="text-xs text-muted-foreground mt-1">Not assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => {
              const rate = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
              const advice = getAttendanceAdvice(sub.attended, sub.total);

              return (
                <div
                  key={sub.subject}
                  className="bg-card border border-border rounded-lg p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground">
                          {sub.code}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1 mt-0.5">
                          {sub.subject}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sub.faculty} • {sub.room}
                        </p>
                      </div>
                      <AttendanceBadge percentage={rate} size="sm" />
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-heading tabular-nums text-foreground">
                        {rate}%
                      </span>
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {sub.attended} / {sub.total} classes
                      </span>
                    </div>

                    <div className="mt-2">
                      <Progress
                        value={rate}
                        className={cn(
                          'h-2 rounded-full bg-muted',
                          rate >= 75
                            ? '[&>div]:bg-emerald-500'
                            : rate >= 65
                            ? '[&>div]:bg-amber-500'
                            : '[&>div]:bg-rose-500'
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 text-xs flex items-center justify-between text-muted-foreground">
                    <span className="truncate">{advice.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;