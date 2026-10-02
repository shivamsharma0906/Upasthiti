import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Copy, 
  Coffee, 
  FlaskConical, 
  BookOpen, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  DayOfWeek, 
  PeriodType, 
  TimetablePeriod, 
  TimetableRecord, 
  ALL_TIMETABLE_DAYS, 
  TIME_SLOTS, 
  DEFAULT_AIML_A_RECORD,
  fetchAllTimetables, 
  saveTimetableApi, 
  deleteTimetableApi,
  timeToMinutes 
} from '@/lib/timetableData';
import { cn } from '@/lib/utils';

// Standard academic option presets
const PROGRAM_OPTIONS = [
  'B.Tech AI & ML',
  'B.Tech Computer Science & Engineering',
  'B.Tech Electronics & Communication',
  'B.Tech Information Technology',
  'BCA',
  'MCA'
];

const DEPARTMENT_OPTIONS = [
  'Artificial Intelligence & Machine Learning',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Information Technology'
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

const SECTION_OPTIONS = ['AIML A', 'Section A', 'Section B', 'Section C', 'A', 'B'];
const SESSION_OPTIONS = ['2024-2025', '2025-2026'];

const TIME_OPTIONS = [
  '09:00',
  '09:50',
  '10:40',
  '11:30',
  '12:20',
  '13:10',
  '14:00',
  '14:50',
  '15:40',
  '16:30',
  '17:20'
];

export const Timetables: React.FC = () => {
  const [timetables, setTimetables] = useState<TimetableRecord[]>([DEFAULT_AIML_A_RECORD]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>(DEFAULT_AIML_A_RECORD.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form academic state for current timetable
  const [program, setProgram] = useState('B.Tech AI & ML');
  const [department, setDepartment] = useState('Artificial Intelligence & Machine Learning');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('5th Semester');
  const [section, setSection] = useState('AIML A');
  const [academicSession, setAcademicSession] = useState('2024-2025');
  const [classes, setClasses] = useState<TimetablePeriod[]>(DEFAULT_AIML_A_RECORD.classes);

  // Modal Dialog state for adding/editing class
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Dialog Form fields
  const [periodDay, setPeriodDay] = useState<DayOfWeek>('Monday');
  const [periodType, setPeriodType] = useState<PeriodType>('theory');
  const [periodSubject, setPeriodSubject] = useState('');
  const [periodSubjectCode, setPeriodSubjectCode] = useState('');
  const [periodFaculty, setPeriodFaculty] = useState('');
  const [periodRoom, setPeriodRoom] = useState('');
  const [periodStartTime, setPeriodStartTime] = useState('09:00');
  const [periodEndTime, setPeriodEndTime] = useState('10:40');
  const [periodLabel, setPeriodLabel] = useState('');

  // Delete Timetable Confirmation Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load all saved timetables from backend on mount
  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    setIsLoading(true);
    try {
      const records = await fetchAllTimetables();
      if (records && records.length > 0) {
        setTimetables(records);
        // Select first or existing selected
        const current = records.find(r => r.id === selectedTimetableId) || records[0];
        loadRecordIntoEditor(current);
      }
    } catch (e) {
      console.error('Error loading timetables:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecordIntoEditor = (rec: TimetableRecord) => {
    setSelectedTimetableId(rec.id);
    setProgram(rec.program);
    setDepartment(rec.department);
    setYear(rec.year);
    setSemester(rec.semester);
    setSection(rec.section);
    setAcademicSession(rec.academicSession);
    setClasses(rec.classes || []);
  };

  // Switch to a new empty routine
  const handleStartNewTimetable = () => {
    const newId = `custom-${Date.now()}`;
    setSelectedTimetableId(newId);
    setProgram('B.Tech Computer Science & Engineering');
    setDepartment('Computer Science & Engineering');
    setYear('3rd Year');
    setSemester('5th Semester');
    setSection('Section A');
    setAcademicSession('2024-2025');
    setClasses([]);
    toast({
      title: 'New Routine Draft Created',
      description: 'Configure your target section and add period blocks in the weekly grid.',
    });
  };

  // Open modal to add period
  const handleOpenAddPeriod = (day: DayOfWeek = 'Monday', defaultType: PeriodType = 'theory') => {
    setEditingPeriodId(null);
    setPeriodDay(day);
    setPeriodType(defaultType);
    setPeriodSubject(defaultType === 'recess' ? 'RECESS' : defaultType === 'free' ? 'Free Period' : '');
    setPeriodSubjectCode('');
    setPeriodFaculty('');
    setPeriodRoom(defaultType === 'recess' ? 'Campus Break' : defaultType === 'free' ? '' : '6010');
    setPeriodStartTime(defaultType === 'recess' ? '13:10' : '09:00');
    setPeriodEndTime(defaultType === 'recess' ? '14:00' : '10:40');
    setPeriodLabel('');
    setIsDialogOpen(true);
  };

  // Open modal to edit existing period
  const handleOpenEditPeriod = (period: TimetablePeriod) => {
    setEditingPeriodId(period.id);
    setPeriodDay(period.day);
    setPeriodType(period.type);
    setPeriodSubject(period.subject);
    setPeriodSubjectCode(period.subjectCode || '');
    setPeriodFaculty(period.faculty || '');
    setPeriodRoom(period.room || '');
    setPeriodStartTime(period.startTime);
    setPeriodEndTime(period.endTime);
    setPeriodLabel(period.label || '');
    setIsDialogOpen(true);
  };

  // Save period inside editor
  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();

    if (!periodSubject.trim() && periodType !== 'recess' && periodType !== 'free') {
      toast({
        title: 'Subject Name Required',
        description: 'Please enter a valid subject name for this period.',
        variant: 'destructive',
      });
      return;
    }

    if (timeToMinutes(periodEndTime) <= timeToMinutes(periodStartTime)) {
      toast({
        title: 'Invalid Period Duration',
        description: 'End time must be later than start time.',
        variant: 'destructive',
      });
      return;
    }

    const displayTime = `${periodStartTime}–${periodEndTime}`;
    const newPeriod: TimetablePeriod = {
      id: editingPeriodId || `period-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      day: periodDay,
      startTime: periodStartTime,
      endTime: periodEndTime,
      displayTime,
      subject: periodSubject.trim() || (periodType === 'recess' ? 'RECESS' : 'Free Period'),
      subjectCode: periodSubjectCode.trim() || undefined,
      faculty: periodFaculty.trim(),
      room: periodRoom.trim(),
      type: periodType,
      label: periodLabel.trim() || undefined,
      program,
      semester,
      section,
    };

    if (editingPeriodId) {
      setClasses(prev => prev.map(p => p.id === editingPeriodId ? newPeriod : p));
      toast({
        title: 'Class Updated',
        description: `${newPeriod.subject} (${newPeriod.displayTime}) updated for ${newPeriod.day}.`,
      });
    } else {
      setClasses(prev => [...prev, newPeriod]);
      toast({
        title: 'Class Added',
        description: `${newPeriod.subject} (${newPeriod.displayTime}) scheduled for ${newPeriod.day}.`,
      });
    }

    setIsDialogOpen(false);
  };

  // Delete period
  const handleDeletePeriod = (id: string) => {
    setClasses(prev => prev.filter(p => p.id !== id));
    toast({
      title: 'Class Removed',
      description: 'Period removed from schedule.',
    });
  };

  // Quick action: Add Standard Recess (01:10 - 02:00) to a day
  const handleAddRecessToDay = (day: DayOfWeek) => {
    const recessExists = classes.some(c => c.day === day && c.type === 'recess');
    if (recessExists) {
      toast({
        title: 'Recess Already Scheduled',
        description: `Recess is already present on ${day}.`,
      });
      return;
    }
    const recessPeriod: TimetablePeriod = {
      id: `recess-${day.toLowerCase()}-${Date.now()}`,
      day,
      startTime: '13:10',
      endTime: '14:00',
      displayTime: '01:10–02:00',
      subject: 'RECESS',
      faculty: '',
      room: 'Campus Break',
      type: 'recess',
      program,
      semester,
      section,
    };
    setClasses(prev => [...prev, recessPeriod]);
    toast({
      title: 'Recess Added',
      description: `Scheduled 01:10–02:00 Recess for ${day}.`,
    });
  };

  // Save the full timetable to the backend
  const handleSaveTimetable = async () => {
    if (!program.trim() || !semester.trim() || !section.trim()) {
      toast({
        title: 'Academic Details Incomplete',
        description: 'Please specify Program, Semester, and Section.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const isExisting = timetables.some(t => t.id === selectedTimetableId);
      const payload = {
        program: program.trim(),
        department: department.trim(),
        year: year.trim(),
        semester: semester.trim(),
        section: section.trim(),
        academicSession: academicSession.trim(),
        classes,
      };

      const res = await saveTimetableApi(payload, isExisting ? selectedTimetableId : undefined);

      if (!res.ok) {
        toast({
          title: 'Save Failed',
          description: res.error || 'A timetable for this academic combination may already exist.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: 'Timetable Saved Successfully',
        description: `Routine for ${program} • ${semester} • Section ${section} is saved and live.`,
      });

      // Refresh list
      const updatedList = await fetchAllTimetables();
      setTimetables(updatedList);
      if (res.timetable) {
        setSelectedTimetableId(res.timetable.id);
      }
    } catch (e: any) {
      toast({
        title: 'Network Error',
        description: e.message || 'Failed to persist timetable.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an entire timetable
  const handleDeleteTimetable = async (id: string) => {
    try {
      const res = await deleteTimetableApi(id);
      if (!res.ok) {
        toast({
          title: 'Cannot Delete',
          description: res.error || 'Unable to delete timetable routine.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Timetable Deleted',
        description: 'Routine deleted from institution registry.',
      });

      const updated = await fetchAllTimetables();
      setTimetables(updated);
      if (updated.length > 0) {
        loadRecordIntoEditor(updated[0]);
      }
    } catch (e: any) {
      toast({
        title: 'Delete Failed',
        description: e.message || 'Error deleting routine.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. HEADER & CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <span>Admin</span>
            <span>/</span>
            <span>Academic Operations</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Timetable Builder</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Institutional Timetable Builder
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, configure, and assign multi-section weekly routines across university departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewTimetable}
            className="gap-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Section Routine</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveTimetable}
            disabled={isSaving}
            className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Routine'}</span>
          </Button>
        </div>
      </div>

      {/* 2. EXISTING SAVED TIMETABLES DIRECTORY (ROUTINE SWITCHER) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
              Institutional Routines Directory ({timetables.length})
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Click to load & edit section schedule
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {timetables.map((t) => {
            const isSelected = t.id === selectedTimetableId;
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all shrink-0 cursor-pointer select-none",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary font-semibold shadow-2xs"
                    : "bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => loadRecordIntoEditor(t)}
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-foreground truncate max-w-[170px]">
                    {t.program}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {t.semester} • {t.section}
                  </span>
                </div>

                <Badge variant="outline" className="text-[9px] font-mono shrink-0 ml-1">
                  {t.classes?.length || 0} periods
                </Badge>

                {timetables.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(t.id);
                    }}
                    title="Delete this routine"
                    className="p-1 hover:text-rose-600 rounded text-muted-foreground/60 transition-colors ml-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TARGET ACADEMIC GROUP SELECTOR */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Target Academic Group Configuration
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Unique Identity: Program + Year + Semester + Section + Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Program */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Program / Course
            </Label>
            <input
              type="text"
              list="programs-list"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
              placeholder="e.g. B.Tech AI & ML"
            />
            <datalist id="programs-list">
              {PROGRAM_OPTIONS.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Department
            </Label>
            <input
              type="text"
              list="departments-list"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
              placeholder="e.g. AI & ML"
            />
            <datalist id="departments-list">
              {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Academic Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Semester
            </Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="h-9 text-xs font-mono">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Section
            </Label>
            <input
              type="text"
              list="sections-list"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono font-bold"
              placeholder="e.g. AIML A"
            />
            <datalist id="sections-list">
              {SECTION_OPTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Academic Session */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Academic Session
            </Label>
            <Select value={academicSession} onValueChange={setAcademicSession}>
              <SelectTrigger className="h-9 text-xs font-mono">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. VISUAL TIMETABLE GRID EDITOR (Monday to Saturday) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Weekly Routine Editor (Monday – Saturday)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Editing routine for <span className="font-semibold text-foreground">{program}</span> • <span className="font-mono text-foreground font-semibold">{semester}</span> • Section <span className="font-mono text-primary font-bold">{section}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Theory
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Lab
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Recess
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Free Period
            </span>
          </div>
        </div>

        {/* Days Rows */}
        <div className="space-y-4">
          {ALL_TIMETABLE_DAYS.map((day) => {
            const dayClasses = classes
              .filter(c => c.day === day)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

            return (
              <div 
                key={day} 
                className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3 transition-colors hover:border-border/90"
              >
                {/* Day Row Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-foreground w-28">
                      {day}
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {dayClasses.length} {dayClasses.length === 1 ? 'Period' : 'Periods'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddRecessToDay(day)}
                      className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-amber-600"
                    >
                      <Coffee className="h-3 w-3" />
                      <span>+ Recess</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddPeriod(day, 'free')}
                      className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Free Slot</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddPeriod(day, 'lab')}
                      className="h-7 text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                    >
                      <FlaskConical className="h-3 w-3" />
                      <span>+ Lab</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenAddPeriod(day, 'theory')}
                      className="h-7 text-[11px] gap-1 bg-primary text-primary-foreground font-semibold shadow-2xs"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Add Class</span>
                    </Button>
                  </div>
                </div>

                {/* Day Period Blocks */}
                {dayClasses.length === 0 ? (
                  <div className="py-4 text-center border border-dashed border-border/70 rounded-lg bg-muted/10 text-xs text-muted-foreground">
                    No classes or events scheduled on {day}. Click '+ Add Class' to add lectures or labs.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {dayClasses.map((period) => (
                      <div
                        key={period.id}
                        className={cn(
                          "rounded-lg border p-3 flex flex-col justify-between space-y-2 text-xs shadow-2xs transition-all relative group",
                          period.type === 'theory' && "bg-card border-border hover:border-primary/40",
                          period.type === 'lab' && "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400",
                          period.type === 'recess' && "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800",
                          period.type === 'free' && "bg-muted/30 border-dashed border-border/80 text-muted-foreground",
                          period.type === 'tutorial' && "bg-violet-50/30 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800"
                        )}
                      >
                        {/* Top: Slot & Badges */}
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-mono font-bold text-foreground text-[11px] flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary shrink-0" />
                            {period.displayTime}
                          </span>

                          <div className="flex items-center gap-1">
                            {period.type === 'theory' && (
                              <Badge variant="outline" className="text-[9px] font-mono border-primary/30 text-primary py-0">
                                Theory
                              </Badge>
                            )}
                            {period.type === 'lab' && (
                              <Badge variant="default" className="text-[9px] font-mono bg-emerald-600 text-white py-0">
                                Lab
                              </Badge>
                            )}
                            {period.type === 'recess' && (
                              <Badge variant="secondary" className="text-[9px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 py-0">
                                Recess
                              </Badge>
                            )}
                            {period.type === 'free' && (
                              <Badge variant="secondary" className="text-[9px] font-mono py-0">
                                Free
                              </Badge>
                            )}
                            {period.type === 'tutorial' && (
                              <Badge variant="outline" className="text-[9px] font-mono border-violet-400 text-violet-600 py-0">
                                Tutorial
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Subject & Faculty */}
                        <div>
                          <h4 className="font-bold text-foreground text-sm line-clamp-1 leading-snug">
                            {period.subject}
                          </h4>
                          {period.subjectCode && (
                            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                              [{period.subjectCode}]
                            </span>
                          )}
                          {period.faculty && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <UserIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{period.faculty}</span>
                            </p>
                          )}
                        </div>

                        {/* Footer: Room & Action Buttons */}
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                          {period.room ? (
                            <span className="font-mono text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="font-semibold text-foreground">{period.room}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-mono">—</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditPeriod(period)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit class"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePeriod(period.id)}
                              className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
                              title="Delete class"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ADD / EDIT PERIOD MODAL DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSavePeriod}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>{editingPeriodId ? 'Edit Scheduled Class' : 'Add Class / Lab to Timetable'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure timing, faculty, subject code, and classroom for {periodDay}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              {/* Day & Class Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Day of Week</Label>
                  <Select value={periodDay} onValueChange={(v) => setPeriodDay(v as DayOfWeek)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TIMETABLE_DAYS.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Class Type</Label>
                  <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory" className="text-xs">Theory Lecture</SelectItem>
                      <SelectItem value="lab" className="text-xs">Laboratory (Lab)</SelectItem>
                      <SelectItem value="tutorial" className="text-xs">Tutorial</SelectItem>
                      <SelectItem value="recess" className="text-xs">Recess Break</SelectItem>
                      <SelectItem value="free" className="text-xs">Free Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Name & Subject Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Subject Name</Label>
                  <Input
                    required
                    value={periodSubject}
                    onChange={(e) => setPeriodSubject(e.target.value)}
                    placeholder="e.g. Intro to ML, Cloud Computing"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Subject Code</Label>
                  <Input
                    value={periodSubjectCode}
                    onChange={(e) => setPeriodSubjectCode(e.target.value)}
                    placeholder="e.g. AIML501"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Start Time (24h)</Label>
                  <input
                    type="text"
                    list="times-list"
                    value={periodStartTime}
                    onChange={(e) => setPeriodStartTime(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
                    placeholder="09:00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">End Time (24h)</Label>
                  <input
                    type="text"
                    list="times-list"
                    value={periodEndTime}
                    onChange={(e) => setPeriodEndTime(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
                    placeholder="10:40"
                  />
                </div>
                <datalist id="times-list">
                  {TIME_OPTIONS.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>

              {/* Faculty & Room / Lab */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Faculty In-Charge</Label>
                  <Input
                    value={periodFaculty}
                    onChange={(e) => setPeriodFaculty(e.target.value)}
                    placeholder="e.g. UKS, HB, Sourav"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Room / Lab No.</Label>
                  <Input
                    value={periodRoom}
                    onChange={(e) => setPeriodRoom(e.target.value)}
                    placeholder="e.g. 6010, LAB 13, 13013"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Optional Display Label */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Optional Display Label</Label>
                <Input
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. Batch 1 Lab • Core Departmental Lecture"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary text-primary-foreground font-semibold"
              >
                {editingPeriodId ? 'Apply Changes' : 'Add to Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. CONFIRM DELETE TIMETABLE DIALOG */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Delete Academic Routine?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently remove this section timetable? Students assigned to this section will no longer see this schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && handleDeleteTimetable(deleteConfirmId)}
              className="text-xs font-semibold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetables;
