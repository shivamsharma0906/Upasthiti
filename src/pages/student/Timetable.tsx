import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Coffee, 
  FlaskConical, 
  Sparkles, 
  ChevronRight, 
  QrCode,
  CalendarDays,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DayOfWeek, 
  PeriodType, 
  TimetablePeriod, 
  TimetableRecord,
  DEFAULT_AIML_A_RECORD,
  ALL_TIMETABLE_DAYS,
  TIMETABLE_WEEKDAYS, 
  fetchAllTimetables,
  matchStudentTimetable,
  getClassesForDay, 
  getTodayClassStatus,
  timeToMinutes 
} from '@/lib/timetableData';
import { cn } from '@/lib/utils';

export const Timetable: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load all timetables from server or cache
  const [timetables, setTimetables] = useState<TimetableRecord[]>([DEFAULT_AIML_A_RECORD]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllTimetables()
      .then((records) => {
        if (records && records.length > 0) {
          setTimetables(records);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Match the student's assigned timetable
  const { timetable: activeTimetable, isMatched } = useMemo(() => {
    return matchStudentTimetable(timetables, user);
  }, [timetables, user]);

  // Current real-time tracking
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine weekdays to display (include Saturday if any classes exist on Saturday)
  const displayDays = useMemo<DayOfWeek[]>(() => {
    const hasSaturdayClasses = (activeTimetable.classes || []).some((c) => c.day === 'Saturday');
    return hasSaturdayClasses ? ALL_TIMETABLE_DAYS : TIMETABLE_WEEKDAYS;
  }, [activeTimetable]);

  // Determine current weekday name
  const currentDayName = useMemo<DayOfWeek | null>(() => {
    const dayIdx = new Date().getDay();
    // 0 is Sunday, 1 is Monday ... 5 is Friday, 6 is Saturday
    if (dayIdx >= 1 && dayIdx <= 5) {
      return TIMETABLE_WEEKDAYS[dayIdx - 1];
    }
    if (dayIdx === 6) {
      return 'Saturday';
    }
    return null; // Sunday / Weekend
  }, []);

  // Selected tab for day view
  const [activeDay, setActiveDay] = useState<DayOfWeek>(currentDayName || 'Monday');

  // Today's classes and status from resolved timetable
  const todayClasses = useMemo(() => {
    if (!currentDayName) return [];
    return getClassesForDay(currentDayName, activeTimetable.classes);
  }, [currentDayName, activeTimetable]);

  const { currentClass, nextClass } = useMemo(() => {
    if (!currentDayName) return { currentClass: null, nextClass: null };
    return getTodayClassStatus(currentDayName, currentMinutes, activeTimetable.classes);
  }, [currentDayName, currentMinutes, activeTimetable]);

  // Classes for active tab
  const activeDayClasses = useMemo(() => {
    return getClassesForDay(activeDay, activeTimetable.classes);
  }, [activeDay, activeTimetable]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER & METADATA */}
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
            <span className="text-foreground font-semibold">Weekly Timetable</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-primary" />
            Official Academic Timetable
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Departmental lecture routine and laboratory schedule for {activeTimetable.program}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/qr-scanner')}
            size="sm"
            className="gap-2 text-xs font-semibold shadow-xs bg-primary text-primary-foreground"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Scan Attendance</span>
          </Button>
        </div>
      </div>

      {/* 2. PROGRAM & SECTION METADATA BAR */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-medium">Routine For:</span>
          <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
            {activeTimetable.program}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {activeTimetable.semester}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary font-semibold">
            Section: {activeTimetable.section}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            Session: {activeTimetable.academicSession}
          </Badge>
          {isMatched && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3" />
              Verified Section Routine
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>
            {currentDayName ? `Today: ${currentDayName}` : 'Weekend (No regular classes)'}
          </span>
        </div>
      </div>

      {/* 3. CURRENT CLASS & NEXT CLASS CALLOUT (If today has scheduled classes) */}
      {currentDayName && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current In-Progress Class */}
          <div className={cn(
            "rounded-xl p-4 border transition-all shadow-xs flex flex-col justify-between",
            currentClass
              ? currentClass.type === 'recess'
                ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                : currentClass.type === 'lab'
                ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                : "bg-primary/5 border-primary/30"
              : "bg-card border-border"
          )}>
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Current Status
              </span>
              {currentClass ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ongoing Now
                </span>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground">
                  No Active Session
                </span>
              )}
            </div>

            {currentClass ? (
              <div className="pt-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {currentClass.subject}
                    </h3>
                    {currentClass.faculty && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <UserIcon className="h-3 w-3" />
                        Faculty: {currentClass.faculty}
                      </p>
                    )}
                  </div>
                  {currentClass.room && (
                    <Badge variant="outline" className="font-mono text-xs font-semibold">
                      Room: {currentClass.room}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1">
                  <span>Slot: {currentClass.displayTime}</span>
                  {currentClass.type === 'theory' && (
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/qr-scanner')}
                      className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs font-semibold"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Scan QR
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No class currently in session.
              </div>
            )}
          </div>

          {/* Next Upcoming Class */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Next Upcoming Class
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {currentDayName}
              </span>
            </div>

            {nextClass ? (
              <div className="pt-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {nextClass.subject}
                    </h3>
                    {nextClass.faculty && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <UserIcon className="h-3 w-3" />
                        Faculty: {nextClass.faculty}
                      </p>
                    )}
                  </div>
                  {nextClass.room && (
                    <Badge variant="outline" className="font-mono text-xs font-semibold">
                      Room: {nextClass.room}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1">
                  <span>Starts at: {nextClass.startTime} ({nextClass.displayTime})</span>
                  <Badge variant={nextClass.type === 'lab' ? 'default' : 'secondary'} className="text-[10px] uppercase font-mono">
                    {nextClass.type}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                All scheduled classes for today have concluded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DAY SELECTOR TABS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            {displayDays.map((day) => {
              const isToday = day === currentDayName;
              const isSelected = day === activeDay;

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 border select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/40",
                    isToday && !isSelected && "border-primary/50 text-primary"
                  )}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={cn(
                      "text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Theory
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Lab
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Recess
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Free
            </span>
          </div>
        </div>

        {/* 5. ACTIVE DAY SCHEDULE CARDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Schedule for {activeDay} ({activeDayClasses.length} {activeDayClasses.length === 1 ? 'period' : 'periods'})
            </span>
            <span className="font-mono text-[11px]">
              {activeTimetable.section} • {activeTimetable.semester}
            </span>
          </div>

          {activeDayClasses.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold text-foreground">No periods scheduled for {activeDay}.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Enjoy your off-period or use this time for independent project work.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeDayClasses.map((period) => {
                const isToday = activeDay === currentDayName;
                const isCurrent = isToday && currentClass?.id === period.id;

                return (
                  <div
                    key={period.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all shadow-xs flex flex-col justify-between space-y-3",
                      // Visual treatment based on period type
                      period.type === 'theory' && "bg-card border-border hover:border-primary/40",
                      period.type === 'lab' && "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400",
                      period.type === 'recess' && "bg-amber-50/30 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/60",
                      period.type === 'free' && "bg-muted/20 border-dashed border-border/80 opacity-80",
                      period.type === 'tutorial' && "bg-violet-50/20 dark:bg-violet-950/10 border-violet-300 dark:border-violet-800/80",
                      // Highlight if active right now
                      isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary shadow-md"
                    )}
                  >
                    {/* Top Bar: Timing & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-primary shrink-0" />
                          <span>{period.displayTime}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-primary text-primary-foreground font-mono">
                            Live
                          </span>
                        )}

                        {period.type === 'theory' && (
                          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                            Theory
                          </Badge>
                        )}
                        {period.type === 'lab' && (
                          <Badge variant="default" className="text-[10px] font-mono bg-emerald-600 text-white dark:bg-emerald-700">
                            <FlaskConical className="h-3 w-3 mr-1" /> Lab
                          </Badge>
                        )}
                        {period.type === 'recess' && (
                          <Badge variant="secondary" className="text-[10px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300">
                            <Coffee className="h-3 w-3 mr-1" /> Recess
                          </Badge>
                        )}
                        {period.type === 'free' && (
                          <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                            Free Slot
                          </Badge>
                        )}
                        {period.type === 'tutorial' && (
                          <Badge variant="outline" className="text-[10px] font-mono border-violet-400 text-violet-600">
                            Tutorial
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Body: Subject & Faculty */}
                    <div className="space-y-1">
                      <h4 className={cn(
                        "font-bold text-base leading-tight",
                        period.type === 'free' ? "text-muted-foreground font-medium" : "text-foreground"
                      )}>
                        {period.subject}
                      </h4>

                      {period.faculty ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                          <UserIcon className="h-3 w-3 shrink-0" />
                          <span>Faculty: <span className="font-semibold text-foreground/80">{period.faculty}</span></span>
                        </p>
                      ) : period.type === 'recess' ? (
                        <p className="text-xs text-muted-foreground pt-0.5">
                          Institutional break for lunch & personal refresh
                        </p>
                      ) : period.type === 'free' ? (
                        <p className="text-xs text-muted-foreground pt-0.5">
                          Independent study, library, or project work
                        </p>
                      ) : null}
                    </div>

                    {/* Footer: Room / Location */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      {period.room ? (
                        <span className="flex items-center gap-1 font-mono text-muted-foreground text-[11px]">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          Room: <span className="font-bold text-foreground">{period.room}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          —
                        </span>
                      )}

                      {isCurrent && period.type === 'theory' && (
                        <button 
                          onClick={() => navigate('/qr-scanner')}
                          className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          Scan Attendance <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. WEEK AT A GLANCE TABLE (Desktop overview) */}
        <div className="mt-8 space-y-3 hidden lg:block">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>Full Weekly Matrix ({displayDays[0]} – {displayDays[displayDays.length - 1]})</span>
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              Official Institutional Grid • {activeTimetable.section}
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4 w-28">Day</th>
                    <th className="py-3 px-4">Morning (09:00 - 13:10)</th>
                    <th className="py-3 px-4 w-32 bg-amber-500/5 text-amber-800 dark:text-amber-300">Recess (01:10 - 02:00)</th>
                    <th className="py-3 px-4">Afternoon (02:00 - 05:20)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {displayDays.map((day) => {
                    const isToday = day === currentDayName;
                    const dayItems = getClassesForDay(day, activeTimetable.classes);
                    const morning = dayItems.filter((i) => timeToMinutes(i.endTime) <= timeToMinutes('13:10') && i.type !== 'recess');
                    const afternoon = dayItems.filter((i) => timeToMinutes(i.startTime) >= timeToMinutes('14:00') && i.type !== 'recess');

                    return (
                      <tr 
                        key={day} 
                        className={cn(
                          "transition-colors",
                          isToday ? "bg-primary/5 font-medium" : "hover:bg-muted/20"
                        )}
                      >
                        <td className="py-3.5 px-4 font-bold text-foreground align-top">
                          <div className="flex items-center gap-1.5">
                            <span>{day}</span>
                            {isToday && (
                              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-primary text-primary-foreground font-bold">
                                Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Morning */}
                        <td className="py-3 px-4 align-top">
                          <div className="space-y-1.5">
                            {morning.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground italic">No morning sessions</span>
                            ) : (
                              morning.map((m) => (
                                <div 
                                  key={m.id}
                                  className={cn(
                                    "p-1.5 rounded-md border text-xs flex items-center justify-between gap-2",
                                    m.type === 'lab' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200" :
                                    m.type === 'free' ? "bg-muted/40 border-dashed text-muted-foreground" :
                                    "bg-card border-border"
                                  )}
                                >
                                  <div>
                                    <span className="font-semibold text-foreground">{m.subject}</span>
                                    {m.faculty && <span className="text-[11px] text-muted-foreground ml-1">({m.faculty})</span>}
                                    {m.room && <span className="text-[10px] font-mono text-muted-foreground ml-1">[{m.room}]</span>}
                                  </div>
                                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{m.displayTime}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Recess */}
                        <td className="py-3 px-4 align-middle text-center bg-amber-500/5 text-amber-800 dark:text-amber-300 font-mono text-xs">
                          RECESS
                        </td>

                        {/* Afternoon */}
                        <td className="py-3 px-4 align-top">
                          <div className="space-y-1.5">
                            {afternoon.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground italic">No afternoon sessions</span>
                            ) : (
                              afternoon.map((a) => (
                                <div 
                                  key={a.id}
                                  className={cn(
                                    "p-1.5 rounded-md border text-xs flex items-center justify-between gap-2",
                                    a.type === 'lab' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200" :
                                    a.type === 'free' ? "bg-muted/40 border-dashed text-muted-foreground" :
                                    "bg-card border-border"
                                  )}
                                >
                                  <div>
                                    <span className="font-semibold text-foreground">{a.subject}</span>
                                    {a.faculty && <span className="text-[11px] text-muted-foreground ml-1">({a.faculty})</span>}
                                    {a.room && <span className="text-[10px] font-mono text-muted-foreground ml-1">[{a.room}]</span>}
                                  </div>
                                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{a.displayTime}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
