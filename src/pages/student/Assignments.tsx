import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  UploadCloud, 
  RefreshCw,
  User as UserIcon,
  ExternalLink,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface AssignmentItem {
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
  status: 'pending' | 'submitted' | 'graded';
  submission?: {
    id: string;
    notes: string;
    submittedAt: number;
    grade?: string;
  } | null;
}

export const Assignments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  // Submit modal state
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/assignments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user?.id]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notes: submissionNotes }),
      });

      if (res.ok) {
        toast({
          title: 'Assignment Submitted',
          description: `Your submission for "${selectedAssignment.title}" has been recorded.`,
        });
        setSelectedAssignment(null);
        setSubmissionNotes('');
        fetchAssignments();
      } else {
        toast({
          title: 'Submission Failed',
          description: 'Unable to submit assignment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Failed to communicate with submission service.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.subject.toLowerCase().includes(search.toLowerCase()) ||
        a.faculty.toLowerCase().includes(search.toLowerCase());

      const isOverdue = new Date(a.dueDate).getTime() < Date.now() && a.status === 'pending';
      const effectiveStatus = isOverdue ? 'overdue' : a.status;

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'pending' && (effectiveStatus === 'pending' || effectiveStatus === 'overdue')) ||
        (statusFilter === 'submitted' && (effectiveStatus === 'submitted' || effectiveStatus === 'graded'));

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

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
            <span>Learning</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Course Assignments</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-primary" />
            Curriculum Assignments & Coursework
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scheduled problem sets, practical lab submissions, and term assignments assigned to your section.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignments}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by assignment title, subject, or faculty..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">Status:</span>
          {(['all', 'pending', 'submitted'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border capitalize",
                statusFilter === st
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA: LOADING / REAL ASSIGNMENTS / EMPTY STATE */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-3">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-12 bg-muted/40 rounded-lg" />
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No assignments have been assigned to your section yet.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When departmental faculty publish coursework problem sets or practical reports for {user?.program || 'your program'} ({user?.section || 'your section'}), they will appear here with submission deadlines.
          </p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs text-xs text-muted-foreground space-y-1">
          <Search className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1" />
          <p className="font-semibold text-foreground">No assignments match your search or filter.</p>
          <p>Try resetting the status filter or clearing your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => {
            const isOverdue = new Date(assignment.dueDate).getTime() < Date.now() && assignment.status === 'pending';
            const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';

            return (
              <div
                key={assignment.id}
                className={cn(
                  "bg-card border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4",
                  isSubmitted 
                    ? "border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/10"
                    : isOverdue 
                    ? "border-rose-300/60 dark:border-rose-900/60 bg-rose-50/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {assignment.subject}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isSubmitted ? (
                        <Badge variant="default" className="text-[10px] font-mono bg-emerald-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive" className="text-[10px] font-mono">
                          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-mono border-amber-400 text-amber-700 dark:text-amber-300">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}

                      <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {assignment.points} pts
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {assignment.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                </div>

                {/* Metadata & Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 text-muted-foreground">
                    <p className="flex items-center gap-1 text-[11px]">
                      <UserIcon className="h-3 w-3" />
                      <span>Faculty: <span className="font-semibold text-foreground/80">{assignment.faculty}</span></span>
                    </p>
                    <p className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                  </div>

                  <div>
                    {!isSubmitted ? (
                      <Button
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                        className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-2xs"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Submit Work</span>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Turned In
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SUBMIT ASSIGNMENT DIALOG */}
      <Dialog open={Boolean(selectedAssignment)} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={handleSubmitResponse}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                <span>Submit Coursework</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit your response or project repository link for <span className="font-semibold text-foreground">{selectedAssignment?.title}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{selectedAssignment?.subject}</span>
                  <span className="font-mono text-muted-foreground text-[10px]">Max: {selectedAssignment?.points} pts</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Faculty In-Charge: {selectedAssignment?.faculty}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Submission Notes / Code Link / Answers
                </label>
                <Textarea
                  required
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Enter your solution notes, Git repository URL, or answers..."
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssignment(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Recording...' : 'Confirm Submission'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
