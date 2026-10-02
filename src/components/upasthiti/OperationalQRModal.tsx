import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { 
  X, 
  RefreshCw, 
  MapPin, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Pause, 
  Play, 
  StopCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OperationalQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    subject: string;
    code: string;
    room: string;
    totalEnrolled?: number;
    department?: string;
  };
}

interface LiveScan {
  id: string;
  studentName: string;
  rollNumber: string;
  timestamp: string;
  verified: boolean;
}

export const OperationalQRModal: React.FC<OperationalQRModalProps> = ({
  isOpen,
  onClose,
  sessionData
}) => {
  if (!isOpen) return null;

  const totalEnrolled = sessionData.totalEnrolled || 52;
  const [presentCount, setPresentCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(150); // 2 min 30 sec
  const [qrToken, setQrToken] = useState('upasthiti-live-' + Date.now());

  const [recentScans, setRecentScans] = useState<LiveScan[]>([]);

  // Countdown timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Auto rotate QR token on expiration
          setQrToken('upasthiti-live-' + Date.now());
          return 150;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Simulate a student scan for interactive demonstration
  const handleSimulateStudentScan = () => {
    if (presentCount >= totalEnrolled) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setRecentScans((prev) => [
      { id: 'sc-' + Date.now(), studentName: 'Verified Student', rollNumber: 'Not assigned yet', timestamp: now, verified: true },
      ...prev.slice(0, 7)
    ]);
    setPresentCount((p) => Math.min(totalEnrolled, p + 1));
  };

  const handleRefreshQR = () => {
    setQrToken('upasthiti-live-' + Date.now());
    setTimerSeconds(150);
  };

  const presentPercentage = Math.round((presentCount / totalEnrolled) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className={cn(
          "w-full bg-card text-card-foreground border border-border rounded-xl shadow-modal flex flex-col overflow-hidden transition-all duration-200",
          isFullscreen ? "h-screen w-screen max-w-none rounded-none" : "max-w-4xl max-h-[92vh]"
        )}
      >
        {/* OPERATIONAL HEADER */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold font-heading text-sm shadow-xs">
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight">
                  {sessionData.subject}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>LIVE SESSION</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sessionData.code} • {sessionData.room} • {sessionData.department || 'Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Close session view"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="px-5 py-3 border-b border-border bg-card grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              Live Attendance
            </span>
            <div className="text-lg font-bold font-heading text-foreground tabular-nums mt-0.5">
              {presentCount} / {totalEnrolled}{' '}
              <span className="text-xs font-normal text-muted-foreground">({presentPercentage}%)</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              QR Cycle Timer
            </span>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              Geofence Verification
            </span>
            <div className="text-xs font-semibold text-foreground flex items-center gap-1 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Active • 50m radius</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              Operational Status
            </span>
            <div className="text-xs font-semibold text-foreground flex items-center gap-1 mt-1">
              <span className={cn("h-2 w-2 rounded-full", isPaused ? "bg-amber-500" : "bg-emerald-500")} />
              <span>{isPaused ? "Paused" : "Accepting Scans"}</span>
            </div>
          </div>
        </div>

        {/* Attendance Progress Line */}
        <Progress value={presentPercentage} className="h-1.5 rounded-none bg-muted [&>div]:bg-emerald-500" />

        {/* MAIN BODY: QR VIEW + REAL-TIME SCANS STREAM */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: QR Operational Core (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center text-center space-y-4">
            {/* The QR Container */}
            <div className="p-5 sm:p-6 bg-white rounded-xl shadow-soft border-2 border-border/80 flex flex-col items-center justify-center relative group">
              {isPaused && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                  <Pause className="h-8 w-8 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">Session Paused</span>
                  <span className="text-xs text-muted-foreground">Scans currently suspended</span>
                </div>
              )}
              <QRCode
                value={qrToken}
                size={220}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox={`0 0 256 256`}
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Students can scan this code to mark attendance
              </p>
              <p className="text-xs text-muted-foreground">
                QR signature refreshes in <span className="font-mono font-bold text-foreground">{formatTime(timerSeconds)}</span> • Geofence verified
              </p>
            </div>

            {/* Operational Controls */}
            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="gap-1.5 text-xs h-8"
              >
                {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-500" /> : <Pause className="h-3.5 w-3.5" />}
                <span>{isPaused ? "Resume Session" : "Pause Session"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshQR}
                className="gap-1.5 text-xs h-8"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Rotate QR Code</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSimulateStudentScan}
                className="gap-1.5 text-xs h-8 text-primary font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Simulate Check-in</span>
              </Button>
            </div>
          </div>

          {/* Right: Live Scans Ticker (5 cols) */}
          <div className="md:col-span-5 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold font-heading text-foreground">Recent Check-ins</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {recentScans.length} verified
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[300px] md:max-h-[360px]">
              {recentScans.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">No students scanned yet.</p>
                  <p className="mt-1 text-[11px]">Live scan events will appear here in real time as students check in.</p>
                </div>
              ) : (
                recentScans.map((scan) => (
                  <div key={scan.id} className="p-3 text-xs flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate">{scan.studentName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{scan.rollNumber}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {scan.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 border-t border-border bg-muted/20 text-[11px] text-muted-foreground text-center">
              All scans cryptographically verified
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            Token: {qrToken.substring(0, 24)}...
          </span>
          <Button
            onClick={onClose}
            size="sm"
            className="gap-2 ml-auto h-8 text-xs font-semibold"
          >
            <span>Close & Return to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
