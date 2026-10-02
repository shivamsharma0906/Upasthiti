import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  Download, 
  QrCode, 
  ArrowUpDown,
  BookOpen,
  Clock,
  ShieldCheck,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AttendanceBadge } from '@/components/ui/StatusBadge';
import { StatsCard } from '@/components/ui/stats-card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAttendanceStatus, 
  getAttendanceAdvice, 
  INSTITUTIONAL_MIN_ATTENDANCE 
} from '@/lib/attendanceStatus';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface RealSession {
  id: string;
  teacherId: string;
  department: string;
  subject: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

interface RealAttendanceLog {
  id: string;
  sessionId: string;
  studentId: string;
  method: string;
  timestamp: number;
}

interface FormattedRecord {
  id: string;
  subject: string;
  code: string;
  date: string;
  time: string;
  faculty: string;
  method: string;
  status: 'present';
  sessionInfo: string;
}

interface SubjectAttendanceStat {
  subject: string;
  code: string;
  conducted: number;
  attended: number;
  missed: number;
  rate: number;
}

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendanceLogs, setAttendanceLogs] = useState<RealAttendanceLog[]>([]);
  const [sessions, setSessions] = useState<RealSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Fetch real attendance records and sessions for logged-in student
  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('ems_token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [attRes, sessRes] = await Promise.all([
        fetch(`${API_BASE}/attendance`, { headers }),
        fetch(`${API_BASE}/sessions`, { headers })
      ]);

      if (!attRes.ok) {
        throw new Error(`Failed to load attendance records (status: ${attRes.status})`);
      }
      if (!sessRes.ok) {
        throw new Error(`Failed to load academic session data (status: ${sessRes.status})`);
      }

      const attData = await attRes.json();
      const sessData = await sessRes.json();

      // Ensure defensive filtering: logged-in student only sees their own logs
      const studentId = user?.id;
      const allLogs: RealAttendanceLog[] = attData.attendance || [];
      const userLogs = studentId ? allLogs.filter((log) => log.studentId === studentId) : allLogs;

      setAttendanceLogs(userLogs);
      setSessions(sessData.sessions || []);
    } catch (err: any) {
      console.error('Failed to fetch attendance data:', err);
      setHasError(true);
      setErrorMessage(err?.message || 'Network error communicating with attendance service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Format real records
  const records = useMemo<FormattedRecord[]>(() => {
    return attendanceLogs.map((log) => {
      const session = sessions.find((s) => s.id === log.sessionId);
      const dateObj = new Date(log.timestamp);
      
      const methodLabel = 
        log.method === 'qr' ? 'QR Code' : 
        log.method === 'face' ? 'Face ID' : 
        log.method === 'manual' ? 'Manual Entry' : 
        log.method || 'Verified';

      return {
        id: log.id,
        subject: session?.subject || 'Class Session',
        code: session?.department || 'ACAD',
        date: dateObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        faculty: 'Faculty Assigned',
        method: methodLabel,
        status: 'present',
        sessionInfo: session ? `${session.startTime} - ${session.endTime}` : 'General Session'
      };
    });
  }, [attendanceLogs, sessions]);

  // Unique subjects for filter
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.subject));
    sessions.forEach((s) => set.add(s.subject));
    return Array.from(set);
  }, [records, sessions]);

  // Overview Attendance Calculation
  const stats = useMemo(() => {
    const present = records.length;
    // Total classes held is the number of scheduled sessions held
    const totalHeld = sessions.length;
    // Absent is classes conducted minus classes attended
    const absent = Math.max(0, totalHeld - present);
    // Rate is real attended over conducted, or 0 if no classes
    const rate = totalHeld > 0 ? Math.round((present / totalHeld) * 1000) / 10 : 0;
    // Late check-ins if recorded
    const late = 0; // Existing backend logs are binary Present check-ins
    return { total: totalHeld, present, absent, late, rate };
  }, [records, sessions]);

  const hasAttendanceRecords = records.length > 0;
  const overallStatus = getAttendanceStatus(stats.rate);
  const overallAdvice = getAttendanceAdvice(stats.present, stats.total);

  // Subject-wise Breakdown Computation
  const subjectBreakdown = useMemo<SubjectAttendanceStat[]>(() => {
    if (sessions.length === 0) return [];

    const map = new Map<string, { sessions: RealSession[]; attended: number }>();
    sessions.forEach((s) => {
      const key = s.subject || 'General Course';
      if (!map.has(key)) {
        map.set(key, { sessions: [], attended: 0 });
      }
      map.get(key)!.sessions.push(s);
    });

    attendanceLogs.forEach((log) => {
      const matched = sessions.find((s) => s.id === log.sessionId);
      if (matched) {
        const key = matched.subject || 'General Course';
        if (map.has(key)) {
          map.get(key)!.attended += 1;
        }
      }
    });

    const result: SubjectAttendanceStat[] = [];
    map.forEach((val, key) => {
      const conducted = val.sessions.length;
      const attended = val.attended;
      const missed = Math.max(0, conducted - attended);
      const rate = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;

      result.push({
        subject: key,
        code: val.sessions[0]?.department || 'ACAD',
        conducted,
        attended,
        missed,
        rate
      });
    });

    return result;
  }, [sessions, attendanceLogs]);

  // Courses needing attention (rate < 75%)
  const criticalSubjects = useMemo(() => {
    if (!hasAttendanceRecords && subjectBreakdown.length === 0) return [];
    return subjectBreakdown.filter((sub) => sub.conducted > 0 && sub.rate < INSTITUTIONAL_MIN_ATTENDANCE);
  }, [subjectBreakdown, hasAttendanceRecords]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    let result = records.filter((rec) => {
      const matchSearch =
        rec.subject.toLowerCase().includes(search.toLowerCase()) ||
        rec.code.toLowerCase().includes(search.toLowerCase()) ||
        rec.date.toLowerCase().includes(search.toLowerCase()) ||
        rec.method.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subjectFilter === 'ALL' || rec.subject === subjectFilter;
      const matchMethod = methodFilter === 'ALL' || rec.method === methodFilter;
      return matchSearch && matchSubject && matchMethod;
    });

    if (sortOrder === 'asc') {
      result = [...result].reverse();
    }
    return result;
  }, [records, search, subjectFilter, methodFilter, sortOrder]);

  // Export records to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Subject', 'Course Code', 'Date', 'Time', 'Session Info', 'Method', 'Status'];
    const rows = records.map((r) => [
      `"${r.subject}"`,
      `"${r.code}"`,
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.sessionInfo}"`,
      `"${r.method}"`,
      `"${r.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_statement_${user?.rollNumber || 'student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <span>Academic Portal</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Attendance Records</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-primary" />
            Student Attendance Log & Records
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified check-in audit trail for {user?.name || 'Student'} 
            {user?.rollNumber && <span className="font-mono ml-1 font-semibold text-foreground">({user.rollNumber})</span>}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scan Attendance action */}
          <Button
            onClick={() => navigate('/qr-scanner')}
            size="sm"
            className="gap-2 text-xs font-semibold shadow-xs bg-primary text-primary-foreground"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Scan Attendance</span>
          </Button>

          {/* Export CSV action */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Statement</span>
          </Button>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh Data"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error Banner if API fails */}
      {hasError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 2. ATTENDANCE OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Overall Attendance"
          value={hasAttendanceRecords ? `${stats.rate}%` : '0%'}
          icon={CheckCircle2}
          description={hasAttendanceRecords ? overallStatus.description : "No attendance recorded"}
          statusBadge={hasAttendanceRecords ? <AttendanceBadge percentage={stats.rate} size="sm" /> : undefined}
        />
        <StatsCard
          title="Total Classes"
          value={stats.total}
          icon={BookOpen}
          description="Held in current term"
        />
        <StatsCard
          title="Classes Attended"
          value={stats.present}
          icon={CheckCircle2}
          description="Verified check-ins"
        />
        <StatsCard
          title="Classes Missed"
          value={stats.absent}
          icon={XCircle}
          description="Unexcused absences"
        />
        <StatsCard
          title="Late Arrivals"
          value={stats.late}
          icon={Clock}
          description="Grace window exceeded"
        />
      </div>

      {/* 3. ATTENDANCE THRESHOLD WARNING BANNER */}
      {criticalSubjects.length > 0 ? (
        <div className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Attendance Deficit Warning ({criticalSubjects.length} {criticalSubjects.length === 1 ? 'subject' : 'subjects'} below 75%)
              </h2>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                University regulation requires a minimum 75% attendance for end-semester examinations. You are currently at risk in:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {criticalSubjects.map((sub) => {
                  const advice = getAttendanceAdvice(sub.attended, sub.conducted);
                  return (
                    <div
                      key={sub.subject}
                      className="bg-card border border-amber-200 dark:border-amber-800/80 rounded-md px-3 py-1.5 text-xs flex items-center gap-2 shadow-2xs"
                    >
                      <span className="font-semibold text-foreground">{sub.subject}</span>
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                        {sub.rate}%
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
              Attendance Standing: Safe ({stats.rate}%)
            </span>
            <span className="text-emerald-800 dark:text-emerald-300 ml-1.5">
              All enrolled subjects satisfy the mandatory 75% institutional attendance regulation. {overallAdvice.message}.
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-card/60 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-muted-foreground/60 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">No Attendance Alerts</span> — Your threshold safety status will be tracked dynamically as lecture sessions are held.
          </div>
        </div>
      )}

      {/* 4. SUBJECT-WISE ATTENDANCE BREAKDOWN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Subject-wise Attendance Breakdown</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Course attendance rates, classes conducted, attended, and missed
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {subjectBreakdown.length} {subjectBreakdown.length === 1 ? 'Course' : 'Courses'}
          </span>
        </div>

        {subjectBreakdown.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">No subject attendance records yet.</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Course-wise statistics will be generated when lecture sessions are held and attendance is recorded.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectBreakdown.map((sub) => {
              const advice = getAttendanceAdvice(sub.attended, sub.conducted);
              const status = getAttendanceStatus(sub.rate);

              return (
                <div
                  key={sub.subject}
                  className="bg-card border border-border rounded-xl p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground">
                          {sub.code}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1 mt-0.5">
                          {sub.subject}
                        </h3>
                      </div>
                      <AttendanceBadge percentage={sub.rate} size="sm" />
                    </div>

                    {/* Numbers: Conducted, Attended, Missed */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
                      <div className="bg-muted/30 rounded-md p-2">
                        <span className="text-[10px] text-muted-foreground block uppercase font-mono">Conducted</span>
                        <span className="text-sm font-bold font-mono text-foreground">{sub.conducted}</span>
                      </div>
                      <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/40 rounded-md p-2">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block uppercase font-mono">Attended</span>
                        <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">{sub.attended}</span>
                      </div>
                      <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/40 rounded-md p-2">
                        <span className="text-[10px] text-rose-700 dark:text-rose-300 block uppercase font-mono">Missed</span>
                        <span className="text-sm font-bold font-mono text-rose-700 dark:text-rose-300">{sub.missed}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground text-[11px]">Percentage</span>
                        <span className="font-bold font-mono text-foreground">{sub.rate}%</span>
                      </div>
                      <Progress
                        value={sub.rate}
                        className={cn(
                          'h-2 rounded-full bg-muted',
                          sub.rate >= 75
                            ? '[&>div]:bg-emerald-500'
                            : sub.rate >= 65
                            ? '[&>div]:bg-amber-500'
                            : '[&>div]:bg-rose-500'
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 text-xs flex items-center justify-between text-muted-foreground">
                    <span className="truncate text-[11px]">{advice.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. ATTENDANCE HISTORY TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Attendance History</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Complete chronological audit trail of all verified lecture check-ins
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {records.length} {records.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, code, date, or method..."
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Methods</option>
              <option value="QR Code">QR Code</option>
              <option value="Face ID">Face ID</option>
              <option value="Manual Entry">Manual Entry</option>
            </select>

            {/* Sort Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </Button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          {records.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <Clock className="h-10 w-10 text-muted-foreground mx-auto opacity-40 mb-3" />
              <h3 className="text-base font-semibold text-foreground">No attendance records yet.</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When you attend lectures and scan QR codes, your verified check-ins will appear here.
              </p>
              <div className="pt-2">
                <Button 
                  onClick={() => navigate('/qr-scanner')}
                  size="sm" 
                  className="gap-1.5 text-xs font-semibold"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan QR Attendance</span>
                </Button>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              title="No matching records"
              description="No logs match your filter criteria. Try adjusting your search query or reset filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearch('');
                setSubjectFilter('ALL');
                setMethodFilter('ALL');
              }}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Subject & Course</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Session Timing</th>
                      <th className="py-3 px-4">Verification Method</th>
                      <th className="py-3 px-4 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {filteredRecords.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">{row.subject}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{row.code}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-foreground font-medium">{row.date}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{row.time}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {row.sessionInfo}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                            <QrCode className="h-3.5 w-3.5 text-primary" />
                            <span>{row.method}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Present</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards */}
              <div className="md:hidden divide-y divide-border">
                {filteredRecords.map((row) => (
                  <div key={row.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          {row.code}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground">{row.subject}</h3>
                        <p className="text-xs text-muted-foreground">{row.sessionInfo}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Present</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span className="font-mono">{row.date} • {row.time}</span>
                      <span className="font-mono flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        {row.method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination / Record count footer */}
              <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                <span>Showing {filteredRecords.length} of {records.length} records</span>
                <span className="font-mono text-[11px]">Audit Trail Verified</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
