import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  AlertTriangle,
  UserCheck,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const QUOTES = [
  'Attendance is the first step toward achievement.',
  'Small daily actions build consistent learning.',
  'Show up, learn, and lead by example.',
  'Every class is a chance to grow.'
];

const LS_STUDENTS = 'teacherBranchStudents';
const LS_SESSIONS = 'scheduledSessions';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate motivational quotes
  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 30000);
    return () => clearInterval(id);
  }, []);

  // Seed one dummy class if there are no scheduled sessions
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SESSIONS);
      const sessions: any[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(sessions) || sessions.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const demo = {
          id: String(Date.now()),
          startTime: '09:00',
          endTime: '10:00',
          department: 'Electronics',
          subject: 'maths',
          startDate: today,
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        localStorage.setItem(LS_SESSIONS, JSON.stringify([demo]));
      }
    } catch {}
  }, []);

  // Real-time counts from localStorage
  const { totalStudents, sessionsCount, alertsCount } = useMemo(() => {
    let studentsTotal = 0;
    let sessionsTotal = 0;
    let alerts = 0;
    try {
      const studentsRaw = localStorage.getItem(LS_STUDENTS);
      if (studentsRaw) {
        const map = JSON.parse(studentsRaw) as Record<string, Array<{ name: string; roll: number }>>;
        studentsTotal = Object.values(map).reduce((sum, arr) => sum + arr.length, 0);
      }
      const sessionsRaw = localStorage.getItem(LS_SESSIONS);
      const sessions = sessionsRaw ? (JSON.parse(sessionsRaw) as Array<any>) : [];
      sessionsTotal = sessions.length;
      // Alerts: sessions ending within next 7 days
      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      alerts = sessions.filter((s) => {
        const end = new Date(s.endDate);
        return end >= now && end <= in7;
      }).length;
    } catch {}
    return { totalStudents: studentsTotal, sessionsCount: sessionsTotal, alertsCount: alerts };
  }, [quoteIndex]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome</h1>
        <p className="text-primary-foreground/80">{QUOTES[quoteIndex]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Students" value={String(totalStudents)} icon={Users} description="" variant="primary" />
        <StatsCard title="Schedule" value={String(sessionsCount)} icon={Calendar} description="Sessions" variant="success" />
        <StatsCard title="Alerts" value={String(alertsCount)} icon={AlertTriangle} description="Ending soon" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Upasthiti - Attendance System</CardTitle>
            <CardDescription>Start taking attendance and managing sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full justify-center gap-2" onClick={() => navigate('/teacher/upasthiti?mode=modal&active=schedule')}>
              <UserCheck className="w-4 h-4" />
              Open Upasthiti
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
            <CardDescription>Quick access</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate('/teacher/upasthiti?mode=modal&active=pending-approvals')}>
              <Clock className="w-4 h-4 mr-2" /> Pending Approvals
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/upasthiti?mode=modal&active=schedule')}>
              <Calendar className="w-4 h-4 mr-2" /> Schedule
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/upasthiti?mode=modal&active=attendance-alerts')}>
              <AlertTriangle className="w-4 h-4 mr-2" /> Alerts
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/students')}>
              <Users className="w-4 h-4 mr-2" /> Students
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};