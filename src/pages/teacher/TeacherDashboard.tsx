import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Clock, 
  QrCode, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/ui/stats-card';
import { AttendanceBadge, SessionBadge } from '@/components/ui/StatusBadge';
import { OperationalQRModal } from '@/components/upasthiti/OperationalQRModal';
import { CreateSessionModal } from '@/components/upasthiti/CreateSessionModal';
import { cn } from '@/lib/utils';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeQRData, setActiveQRData] = useState<{
    subject: string;
    code: string;
    room: string;
    totalEnrolled: number;
    department: string;
  } | null>(null);

  // Today's Operational Schedule
  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: 'sch-1',
      subject: 'Data Structures & Algorithms',
      code: 'CS-301',
      room: 'Room 204',
      startTime: '09:00',
      endTime: '10:00',
      enrolled: 52,
      department: 'Computer Science',
      status: 'upcoming' as const
    },
    {
      id: 'sch-2',
      subject: 'Computer Networks',
      code: 'CS-302',
      room: 'Lab 3B',
      startTime: '11:15',
      endTime: '12:15',
      enrolled: 48,
      department: 'Computer Science',
      status: 'upcoming' as const
    },
    {
      id: 'sch-3',
      subject: 'Database Systems Lab',
      code: 'CS-303',
      room: 'Lab 2',
      startTime: '14:00',
      endTime: '16:00',
      enrolled: 55,
      department: 'Computer Science',
      status: 'upcoming' as const
    }
  ]);

  // Students Needing Attention across this faculty's subjects
  const [atRiskStudents, setAtRiskStudents] = useState<
    Array<{
      id: string;
      name: string;
      roll: string;
      course: string;
      attendance: number;
      missed: number;
      status: string;
    }>
  >([]);

  const handleStartAttendance = (session: typeof todaySchedule[0]) => {
    setActiveQRData({
      subject: session.subject,
      code: session.code,
      room: session.room,
      totalEnrolled: session.enrolled,
      department: session.department
    });
  };

  const handleSessionCreated = (newSession: any) => {
    setIsCreateModalOpen(false);
    // Launch the live operational QR modal immediately
    setActiveQRData(newSession);
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO OPERATIONAL PANEL */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-7 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Faculty Operations • Computer Science & Eng.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Good morning, {user?.name || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            You have <span className="font-semibold text-foreground">{todaySchedule.length} lecture sessions</span> scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
            className="gap-2 h-11 px-5 font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Attendance Session</span>
          </Button>
        </div>
      </div>

      {/* 2. TODAY'S SCHEDULE - "What do I need to do today?" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Today's Schedule & Action Items</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Launch live QR verification or view class roster directly
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {todaySchedule.length} Sessions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todaySchedule.map((session, idx) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-lg p-5 shadow-subtle hover:border-border/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-7 px-2 rounded-md bg-muted font-mono font-bold text-xs flex items-center text-foreground">
                      {session.startTime}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      to {session.endTime}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-semibold text-muted-foreground">
                    {session.code}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground font-heading mt-3 line-clamp-1">
                  {session.subject}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {session.room} • {session.enrolled} Enrolled Students
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <Button
                  onClick={() => handleStartAttendance(session)}
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-semibold flex-1 shadow-xs"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Start Attendance</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/teacher/students')}
                  className="h-8 text-xs px-2.5"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DUAL SECTION: STUDENTS NEEDING ATTENTION & OVERVIEW METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Students Needing Attention (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Students Needing Attention (&lt; 75%)</span>
            </h2>
            <button
              onClick={() => navigate('/teacher/upasthiti?mode=modal&active=attendance-alerts')}
              className="text-xs text-primary hover:underline font-medium"
            >
              View All Alerts
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg divide-y divide-border/70 shadow-subtle overflow-hidden">
            {atRiskStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-foreground">No students currently flagged as at-risk.</p>
                <p className="mt-0.5">All enrolled students currently meet the institutional attendance criteria.</p>
              </div>
            ) : (
              atRiskStudents.map((st) => (
                <div key={st.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{st.name}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">({st.roll})</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5 truncate">
                      {st.course} • {st.missed} lectures missed
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "font-mono font-bold text-xs px-2 py-0.5 rounded-full border",
                      st.attendance < 65
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    )}>
                      {st.attendance}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1 hidden sm:inline-flex"
                      onClick={() => alert(`Official academic warning sent to ${st.name}`)}
                    >
                      <Send className="h-3 w-3" />
                      <span>Send Notice</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Course Attendance Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>Course Attendance Rate</span>
            </h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-subtle">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Data Structures (CS-301)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">86.4%</span>
              </div>
              <div className="h-2 rounded-full bg-muted mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '86.4%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>52 Students</span>
                <span>On track</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Computer Networks (CS-302)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">71.2%</span>
              </div>
              <div className="h-2 rounded-full bg-muted mt-1.5 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '71.2%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>48 Students</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">Attention required</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Database Management (CS-303)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">82.5%</span>
              </div>
              <div className="h-2 rounded-full bg-muted mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82.5%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>55 Students</span>
                <span>On track</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE SESSION MODAL */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />

      {/* OPERATIONAL QR THEATER SCREEN */}
      {activeQRData && (
        <OperationalQRModal
          isOpen={!!activeQRData}
          onClose={() => setActiveQRData(null)}
          sessionData={activeQRData}
        />
      )}
    </div>
  );
};