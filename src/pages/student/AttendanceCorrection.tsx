import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileClock, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Send,
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface RealSession {
  id: string;
  department: string;
  subject: string;
  startTime: string;
  endTime: string;
  startDate: string;
}

interface CorrectionItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  sessionId: string;
  subject: string;
  sessionDate: string;
  reason: string;
  requestedStatus: 'Present';
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewerComments?: string;
}

export const AttendanceCorrection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [sessions, setSessions] = useState<RealSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [corRes, sessRes] = await Promise.all([
        fetch(`${API_BASE}/attendance-corrections`, { headers }),
        fetch(`${API_BASE}/sessions`, { headers }),
      ]);

      if (corRes.ok) {
        const data = await corRes.json();
        setCorrections(data.corrections || []);
      }
      if (sessRes.ok) {
        const data = await sessRes.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load correction data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const matched = sessions.find((s) => s.id === sessionId);
    if (matched) {
      setSubjectName(matched.subject);
      setSessionDate(matched.startDate || new Date().toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim() || !sessionDate || !reason.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please select a session or specify the course, lecture date, and justification.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/attendance-corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: selectedSessionId || 'unspecified',
          subject: subjectName.trim(),
          sessionDate,
          reason: reason.trim(),
        }),
      });

      if (res.ok) {
        toast({
          title: 'Correction Request Submitted',
          description: 'Your request has been routed to your professor with status: Pending.',
        });
        setIsDialogOpen(false);
        setSelectedSessionId('');
        setSubjectName('');
        setSessionDate('');
        setReason('');
        loadData();
      } else {
        toast({
          title: 'Request Failed',
          description: 'Failed to record attendance correction. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Unable to communicate with the academic service.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
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
            <span>Services</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Attendance Correction</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <FileClock className="h-6 w-6 text-primary" />
            Attendance Discrepancy & Correction Requests
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit a formal dispute or correction request for a specific lecture session for professor verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Request Correction</span>
          </Button>
        </div>
      </div>

      {/* 2. HISTORY LIST / EMPTY STATE */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      ) : corrections.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <FileClock className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No attendance correction requests submitted.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            If a technical error or scanner issue occurred during an active lecture, select the session and submit a correction request with proof.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Request Correction</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Discrepancy Inquiries ({corrections.length})</span>
            <span>Student: {user?.rollNumber || user?.name}</span>
          </div>

          <div className="space-y-3">
            {corrections.map((item) => {
              const isPending = item.status === 'Pending';
              const isApproved = item.status === 'Approved';
              const isRejected = item.status === 'Rejected';

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-card border rounded-xl p-5 shadow-xs transition-all space-y-3",
                    isApproved && "border-emerald-300 dark:border-emerald-800 bg-emerald-50/10",
                    isRejected && "border-rose-300 dark:border-rose-900 bg-rose-50/10",
                    isPending && "border-amber-300/80 dark:border-amber-800/60 bg-amber-50/10"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {item.subject}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        • Lecture Date: {item.sessionDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Badge variant="outline" className="text-[10px] font-mono border-amber-400 text-amber-700 dark:text-amber-300 font-bold">
                          <Clock className="h-3 w-3 mr-1" /> Pending Review
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge variant="default" className="text-[10px] font-mono bg-emerald-600 text-white font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="destructive" className="text-[10px] font-mono font-bold">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed">
                    <span className="font-semibold text-muted-foreground">Student Explanation:</span> {item.reason}
                  </p>

                  {item.reviewerComments && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Faculty Decision Note:</span> {item.reviewerComments}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                    <span>Submitted on: {new Date(item.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>Dispute ID: {item.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NEW CORRECTION MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileClock className="h-4 w-4 text-primary" />
                <span>Submit Attendance Correction</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dispute an absent check-in by referencing an actual lecture session and providing explanation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              {/* Select Session if sessions exist */}
              {sessions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Select Conducted Lecture Session</Label>
                  <Select value={selectedSessionId} onValueChange={handleSelectSession}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose a conducted session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.subject} ({s.startDate || 'Session'} • {s.startTime}-{s.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Course Name</Label>
                  <Input
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Intro to ML"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Lecture Date</Label>
                  <Input
                    required
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Reason & Evidence Description</Label>
                <Textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you were marked absent (e.g. QR scanner camera malfunction, geofence radius mismatch, lab duty)..."
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
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
                disabled={isSubmitting}
                className="text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceCorrection;
