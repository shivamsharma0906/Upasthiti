import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Send,
  FileText
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

interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  type: 'Medical' | 'Academic' | 'Personal' | 'Other';
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: number;
  reviewedAt?: number;
  comments?: string;
}

export const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<'Medical' | 'Academic' | 'Personal' | 'Other'>('Personal');
  const [reason, setReason] = useState('');

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/leave-requests`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason.trim()) {
      toast({
        title: 'Form Incomplete',
        description: 'Please specify the start date, end date, and reason for leave.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date must be on or after the start date.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/leave-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          startDate,
          endDate,
          type: leaveType,
          reason,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Leave Request Submitted',
          description: 'Your request has been routed to your department head with status: Pending.',
        });
        setIsDialogOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setLeaveType('Personal');
        fetchLeaveRequests();
      } else {
        toast({
          title: 'Submission Error',
          description: 'Failed to record leave application. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Failed to connect to university portal.',
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
            <span className="text-foreground font-semibold">Leave Requests</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <FileCheck className="h-6 w-6 text-primary" />
            Student Leave & Absence Applications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit institutional duty leave or medical absence applications for formal faculty approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaveRequests}
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
            <span>Apply for Leave</span>
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
      ) : requests.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <FileCheck className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No leave applications recorded.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            You currently have no submitted absence requests. If you require medical leave or official college duty sanction, click 'Apply for Leave'.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Apply for Leave</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Submitted Applications ({requests.length})</span>
            <span>Recorded Under: {user?.rollNumber || user?.name}</span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => {
              const isPending = req.status === 'Pending';
              const isApproved = req.status === 'Approved';
              const isRejected = req.status === 'Rejected';

              return (
                <div
                  key={req.id}
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
                        {req.type} Leave
                      </span>

                      <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
                        {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Badge variant="outline" className="text-[10px] font-mono border-amber-400 text-amber-700 dark:text-amber-300 font-bold">
                          <Clock className="h-3 w-3 mr-1" /> Pending Approval
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

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>Duration: {req.startDate} to {req.endDate}</span>
                    </div>

                    <p className="text-foreground/90 leading-relaxed pt-1">
                      {req.reason}
                    </p>
                  </div>

                  {req.comments && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Faculty Remarks:</span> {req.comments}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                    <span>Applied on: {new Date(req.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>Tracking ID: {req.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NEW LEAVE APPLICATION MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                <span>Apply for Student Absence</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit an institutional leave request for formal faculty review and attendance normalization.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Leave Category</Label>
                <Select value={leaveType} onValueChange={(v) => setLeaveType(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical" className="text-xs">Medical Leave (Health)</SelectItem>
                    <SelectItem value="Academic" className="text-xs">Academic / College Duty</SelectItem>
                    <SelectItem value="Personal" className="text-xs">Personal Emergency</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other Authorized Absence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">From Date</Label>
                  <Input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground">To Date</Label>
                  <Input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Reason & Detailed Justification</Label>
                <Textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the necessity of absence and any scheduled examinations affected..."
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
                <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveRequests;
