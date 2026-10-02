import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Activity, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Send,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { AttendanceBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const [departments] = useState([
    { name: 'Computer Science & Engineering', students: 320, sessions: 8, attendanceRate: 84.2, dean: 'Dr. S. K. Roy' },
    { name: 'Information Technology', students: 240, sessions: 6, attendanceRate: 82.8, dean: 'Dr. V. Raman' },
    { name: 'Electronics & Communication', students: 280, sessions: 5, attendanceRate: 80.5, dean: 'Prof. A. Pillai' },
    { name: 'Mechanical Engineering', students: 210, sessions: 4, attendanceRate: 79.1, dean: 'Dr. N. Sengupta' },
    { name: 'Electrical Engineering', students: 198, sessions: 3, attendanceRate: 78.6, dean: 'Prof. M. Joshi' },
  ]);

  const [criticalStudents] = useState<
    Array<{
      id: string;
      name: string;
      roll: string;
      department: string;
      overallAttendance: number;
      alertStatus: string;
    }>
  >([]);

  const [auditLogs] = useState([
    { id: 'aud-1', event: 'Live Session Started', details: 'CS-301 (Data Structures) Room 204 by Prof. Ramesh Gupta', time: '12m ago', type: 'session' },
    { id: 'aud-2', event: 'Geofence Verification Passed', details: '48/52 students verified within 50m radius in Hall A', time: '35m ago', type: 'geo' },
    { id: 'aud-3', event: 'Manual Attendance Override', details: 'Student CS-2024-018 excused for official sports representation', time: '1h ago', type: 'override' },
    { id: 'aud-4', event: 'System Integrity Check', details: 'Database replication & GPS satellite sync operational (99.98% uptime)', time: '3h ago', type: 'system' },
  ]);

  return (
    <div className="space-y-6">
      {/* 1. INSTITUTIONAL HERO HEADER */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-7 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Apex Institute of Technology • Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Institutional Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time telemetry across academic sessions, attendance adherence, and regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-medium">
            <Download className="h-3.5 w-3.5" />
            <span>Export Compliance Report</span>
          </Button>
        </div>
      </div>

      {/* 2. CORE INSTITUTIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Avg Institutional Rate"
          value="81.4%"
          icon={Activity}
          description="Fall Semester 2026"
          trend={1.8}
          statusBadge={<AttendanceBadge percentage={81.4} size="sm" />}
        />
        <StatsCard
          title="Active Live Sessions"
          value="14"
          icon={Activity}
          description="In session right now"
        />
        <StatsCard
          title="Enrolled Students"
          value="1,248"
          icon={GraduationCap}
          description="6 Academic Departments"
        />
        <StatsCard
          title="Faculty Roster"
          value="84"
          icon={Users}
          description="Active instructors"
        />
        <StatsCard
          title="Departments"
          value="6"
          icon={Building2}
          description="Undergraduate & Postgrad"
        />
      </div>

      {/* 3. DEPARTMENT COMPARISON & CRITICAL STUDENTS DUAL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Department Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
                Department Attendance Adherence
              </h2>
              <p className="text-xs text-muted-foreground">
                Comparing aggregate student presence by academic branch
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              75% Required Threshold
            </span>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-subtle">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground truncate max-w-xs">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px] font-mono">
                      {dept.students} students • {dept.sessions} live
                    </span>
                    <span className="font-mono font-bold text-foreground">{dept.attendanceRate}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      dept.attendanceRate >= 80 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${dept.attendanceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Low Attendance Flagged Students (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Critical Debarment Watch (&lt; 65%)</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Students below examination eligibility cutoff
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg divide-y divide-border shadow-subtle overflow-hidden">
            {criticalStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-foreground">No students flagged for debarment.</p>
                <p className="mt-0.5 text-[11px]">All enrolled students are above the 65% critical debarment threshold.</p>
              </div>
            ) : (
              criticalStudents.map((st) => (
                <div key={st.id} className="p-3.5 text-xs flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground truncate">{st.name}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">({st.roll})</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5 truncate">
                      {st.department}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 text-[11px]">
                      {st.overallAttendance}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1 hidden sm:inline-flex"
                      onClick={() => alert(`Official notice sent to ${st.name}`)}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. SYSTEM AUDIT & INTEGRITY FEED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Audit Trail & System Telemetry</span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Cryptographic Verification Active
          </span>
        </div>

        <div className="bg-card border border-border rounded-lg divide-y divide-border/60 shadow-subtle">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 sm:p-4 text-xs flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">{log.event}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0 mt-0.5">
                {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};