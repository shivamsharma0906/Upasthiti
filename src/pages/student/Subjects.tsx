import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Clock, 
  User as UserIcon, 
  MapPin, 
  FlaskConical, 
  Calendar, 
  CalendarCheck, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Layers,
  GraduationCap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { StudentSubject, fetchStudentSubjects } from '@/lib/subjectData';
import { TimetableRecord } from '@/lib/timetableData';
import { cn } from '@/lib/utils';

export const Subjects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [timetable, setTimetable] = useState<TimetableRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Search & Type Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Theory' | 'Lab'>('ALL');

  const loadSubjects = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      const res = await fetchStudentSubjects(user);
      if (res.error) {
        setHasError(true);
        setErrorMessage(res.error);
      } else {
        setSubjects(res.subjects);
        setTimetable(res.timetable);
      }
    } catch (e: any) {
      console.error('Failed to load subjects:', e);
      setHasError(true);
      setErrorMessage(e.message || 'Unable to retrieve enrolled subjects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [user?.id, user?.program, user?.semester, user?.section]);

  // Filtered subjects based on search query and type filter
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch = 
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.faculty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = 
        typeFilter === 'ALL' || subject.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [subjects, searchQuery, typeFilter]);

  // Computed totals for metadata bar
  const theoryCount = useMemo(() => subjects.filter(s => s.type === 'Theory').length, [subjects]);
  const labCount = useMemo(() => subjects.filter(s => s.type === 'Lab').length, [subjects]);
  const totalCredits = useMemo(() => subjects.reduce((sum, s) => sum + s.credits, 0), [subjects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
            <span className="text-foreground font-semibold">My Subjects</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-primary" />
            Enrolled Academic Subjects
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official curriculum courses, registered laboratory sessions, and assigned faculty directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubjects}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => navigate('/student/timetable')}
            size="sm"
            className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Weekly Timetable</span>
          </Button>
        </div>
      </div>

      {/* 2. ACADEMIC PROFILE & SECTION METADATA BAR */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-medium">Curriculum:</span>
          <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
            {timetable?.program || user?.program || 'Academic Program'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {timetable?.semester || user?.semester || 'Semester'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary font-semibold">
            Section: {timetable?.section || user?.section || 'Section'}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            Session: {timetable?.academicSession || user?.academicSession || '2024-2025'}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground font-semibold">{subjects.length}</span> Total Subjects
          </span>
          <span>•</span>
          <span>{theoryCount} Theory</span>
          <span>•</span>
          <span>{labCount} Labs</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-primary font-semibold">
            <Award className="h-3 w-3" />
            {totalCredits} Credits
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject name, code, or faculty..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">Type:</span>
          {(['ALL', 'Theory', 'Lab'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border",
                typeFilter === type
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              )}
            >
              {type === 'ALL' ? 'All Subjects' : type}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CONTENT AREA: LOADING / ERROR / EMPTY / SUBJECTS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-5 w-40 bg-muted rounded" />
                </div>
                <div className="h-5 w-14 bg-muted rounded-full" />
              </div>
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-10 bg-muted/40 rounded-lg" />
              <div className="h-8 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="bg-card border border-rose-200 dark:border-rose-900/60 rounded-xl p-8 text-center shadow-xs space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Failed to Load Enrolled Subjects</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {errorMessage || 'There was an issue communicating with the institutional academic registry.'}
          </p>
          <Button size="sm" onClick={loadSubjects} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No subjects have been assigned to your profile yet.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your course registration or departmental schedule has not been published yet. Please consult your academic coordinator or check back soon.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/student/timetable')}
            className="text-xs gap-1.5 mt-2"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>View Timetable Routine</span>
          </Button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs text-xs text-muted-foreground space-y-1">
          <Search className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1" />
          <p className="font-semibold text-foreground">No matching subjects found.</p>
          <p>Try modifying your search query or switching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className={cn(
                "bg-card border rounded-xl p-5 shadow-xs transition-all hover:border-border/90 flex flex-col justify-between space-y-4",
                subject.type === 'Lab' 
                  ? "border-emerald-300/60 dark:border-emerald-800/50 hover:border-emerald-400" 
                  : "border-border hover:border-primary/40"
              )}
            >
              {/* Card Top: Code, Type Badge & Credits */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {subject.code}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {subject.type === 'Lab' ? (
                      <Badge variant="default" className="text-[10px] font-mono bg-emerald-600 text-white dark:bg-emerald-700">
                        <FlaskConical className="h-3 w-3 mr-1" /> Lab
                      </Badge>
                    ) : subject.type === 'Tutorial' ? (
                      <Badge variant="outline" className="text-[10px] font-mono border-violet-400 text-violet-600">
                        Tutorial
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                        Theory
                      </Badge>
                    )}

                    <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                      {subject.credits} {subject.credits === 1 ? 'Credit' : 'Credits'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                  {subject.name}
                </h3>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <UserIcon className="h-3 w-3 text-primary shrink-0" />
                  <span>Faculty: <span className="font-semibold text-foreground/90">{subject.faculty}</span></span>
                </p>
              </div>

              {/* Attendance Indicator */}
              <div className="bg-muted/30 border border-border/60 rounded-lg p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground block">
                    Recorded Attendance
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    {subject.attendancePercentage !== null ? (
                      <>
                        <span className="text-lg font-bold font-heading tabular-nums text-foreground">
                          {subject.attendancePercentage}%
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          ({subject.classesAttended}/{subject.classesConducted} classes)
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold font-mono text-muted-foreground">
                        --
                      </span>
                    )}
                  </div>
                </div>

                {subject.attendancePercentage !== null ? (
                  <span className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border",
                    subject.attendancePercentage >= 75
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
                  )}>
                    {subject.attendancePercentage >= 75 ? 'Satisfied' : 'Attention'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground italic">
                    No sessions held
                  </span>
                )}
              </div>

              {/* Scheduled Lecture Slots */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary shrink-0" />
                  Scheduled Routine
                </span>
                <div className="space-y-1">
                  {subject.schedule.map((slot, sIdx) => (
                    <div 
                      key={sIdx}
                      className="p-1.5 rounded-md bg-background border border-border/80 text-[11px] font-mono flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground">
                        {slot.day} {slot.time}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-primary" />
                        <span>[{slot.room}]</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Actions: View Attendance & View Timetable */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student/attendance')}
                  className="h-8 text-xs font-medium gap-1"
                >
                  <CalendarCheck className="h-3 w-3 text-muted-foreground" />
                  <span>Attendance</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student/timetable')}
                  className="h-8 text-xs font-medium gap-1"
                >
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>Timetable</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
