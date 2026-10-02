import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Award, 
  GraduationCap, 
  RefreshCw, 
  BookOpen, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface SubjectMarkItem {
  subjectCode: string;
  subjectName: string;
  internalMarks?: number;
  assignmentMarks?: number;
  examMarks?: number;
  totalMarks?: number;
  maxMarks?: number;
  grade?: string;
}

interface PerformanceData {
  id: string;
  studentId: string;
  semester: string;
  academicSession: string;
  cgpa?: number;
  sgpa?: number;
  subjects: SubjectMarkItem[];
  updatedAt: number;
}

export const Performance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPerformance = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/performance`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPerformance(data.performance || null);
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [user?.id]);

  const hasData = performance && performance.subjects && performance.subjects.length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <button 
              onClick={() => navigate('/student')} 
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span>Academic</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Performance</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            Academic Performance & Assessment
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal assessments, assignment grading, semester examinations, and cumulative grade averages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformance}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. STUDENT METADATA */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-medium">Student:</span>
          <span className="font-bold text-foreground">{user?.name}</span>
          <Badge variant="outline" className="font-mono text-[11px]">
            Roll: {user?.rollNumber || 'Not assigned'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {user?.program || 'Program'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {user?.semester || 'Semester'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            Sec: {user?.section || 'Section'}
          </Badge>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Examination Cell • Official Registry
        </div>
      </div>

      {/* 3. CONTENT AREA: LOADING / REAL DATA / EMPTY STATE */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-7 w-28 bg-muted rounded" />
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-8 animate-pulse space-y-3">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-24 bg-muted/40 rounded-lg" />
          </div>
        </div>
      ) : !hasData ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No performance data available yet.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Internal assessment marks, midterm evaluation, and semester examination results have not been published by your departmental examination committee for this academic term.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/subjects')}
              className="text-xs gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>View Enrolled Subjects</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Cumulative GPA (CGPA)
              </span>
              <div className="mt-1 text-2xl font-bold font-heading text-foreground tabular-nums">
                {performance?.cgpa ? performance.cgpa.toFixed(2) : '--'}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Across all registered semesters</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Semester GPA (SGPA)
              </span>
              <div className="mt-1 text-2xl font-bold font-heading text-primary tabular-nums">
                {performance?.sgpa ? performance.sgpa.toFixed(2) : '--'}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Current term: {performance?.semester}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Graded Courses
              </span>
              <div className="mt-1 text-2xl font-bold font-heading text-foreground tabular-nums">
                {performance?.subjects.length}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Evaluated by faculty boards</p>
            </div>
          </div>

          {/* Subject-wise Marks Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs space-y-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Subject-wise Marks & Assessment Breakdown</span>
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Session: {performance?.academicSession}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Internal Marks</th>
                    <th className="py-3 px-4">Assignment</th>
                    <th className="py-3 px-4">Exam Marks</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {performance?.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div>{sub.subjectName}</div>
                        <span className="text-[10px] font-mono text-muted-foreground">{sub.subjectCode}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{sub.internalMarks !== undefined ? sub.internalMarks : '--'}</td>
                      <td className="py-3.5 px-4 font-mono">{sub.assignmentMarks !== undefined ? sub.assignmentMarks : '--'}</td>
                      <td className="py-3.5 px-4 font-mono">{sub.examMarks !== undefined ? sub.examMarks : '--'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {sub.totalMarks !== undefined ? `${sub.totalMarks}/${sub.maxMarks || 100}` : '--'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.grade ? (
                          <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                            {sub.grade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground font-mono">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
