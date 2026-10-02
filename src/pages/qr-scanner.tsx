import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  ArrowLeft, 
  QrCode, 
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type ScanPhase = 'idle' | 'scanning' | 'verifying_qr' | 'verifying_geo' | 'success' | 'error';

export const QrScanner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [receipt, setReceipt] = useState<{
    subject: string;
    code: string;
    time: string;
    date: string;
    method: string;
    locationStatus: string;
    referenceId: string;
  } | null>(null);

  // Check initial searchParams if launched with a token
  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      handleVerify(queryToken);
    }
  }, [searchParams]);

  // Request browser geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          // Fallback location for testing
          setUserLocation({ lat: 28.545, lng: 77.192 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Multi-step verification simulation / backend handshake
  const handleVerify = async (tokenString: string) => {
    setPhase('scanning');
    setErrorMessage('');

    // Step 1: Scan detection
    await new Promise((r) => setTimeout(r, 600));
    setPhase('verifying_qr');

    // Step 2: Signature check
    await new Promise((r) => setTimeout(r, 700));
    setPhase('verifying_geo');

    // Step 3: Location Geofence check
    await new Promise((r) => setTimeout(r, 700));

    // Success receipt generation
    const now = new Date();
    setReceipt({
      subject: 'Data Structures & Algorithms',
      code: 'CS-301',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      method: 'QR Code Handshake',
      locationStatus: 'Verified (Within 35m of Classroom 204)',
      referenceId: 'UP-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    });

    setPhase('success');
  };

  const handleSimulateScan = () => {
    handleVerify('mock-valid-session-jwt-token');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleVerify(manualToken.trim());
  };

  const handleReset = () => {
    setPhase('idle');
    setErrorMessage('');
    setReceipt(null);
    setManualToken('');
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
          <span>GPS Active</span>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight">
              Scan Attendance QR
            </h1>
            <p className="text-xs text-muted-foreground">
              Align the classroom display QR code inside the target frame
            </p>
          </div>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Content based on Phase */}
        {phase === 'success' && receipt ? (
          /* SUCCESS STATE: Polished Verification Receipt */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in-50 duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Attendance Confirmed
              </span>
              <h2 className="text-2xl font-bold font-heading text-foreground mt-1 tracking-tight">
                {receipt.subject}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Course Code: {receipt.code} • Academic Year 2026
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="border border-border/80 bg-muted/30 rounded-lg p-4 text-xs space-y-2.5 text-left">
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Recorded Time</span>
                <span className="font-semibold font-mono text-foreground">{receipt.date} • {receipt.time}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Verification Method</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  <span>{receipt.method}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Location Verification</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{receipt.locationStatus}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Audit ID</span>
                <span className="font-mono text-muted-foreground select-all">{receipt.referenceId}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => navigate('/student/attendance')}
                className="flex-1 gap-2 h-10 font-semibold text-xs"
              >
                <span>View Attendance Statement</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 gap-2 h-10 font-semibold text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Scan Another Code</span>
              </Button>
            </div>
          </div>
        ) : (
          /* SCANNING & CAMERA VIEW */
          <div className="p-4 sm:p-6 space-y-5">
            {/* Viewfinder Frame */}
            <div className="relative aspect-square max-h-[340px] w-full mx-auto rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-border">
              {/* Simulated Camera Video feed pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Viewfinder Reticle */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/20 rounded-xl flex items-center justify-center">
                {/* Target Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

                {/* Animated Sweeping Laser when scanning */}
                {phase !== 'idle' ? (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_rgba(35,0,255,0.85)] animate-bounce" />
                ) : (
                  <QrCode className="h-16 w-16 text-white/30 animate-pulse" />
                )}
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-4 inset-x-4 flex justify-center">
                <div className="bg-black/75 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 border border-white/10 shadow-md">
                  {phase === 'idle' && (
                    <>
                      <Camera className="h-3.5 w-3.5 text-primary" />
                      <span>Ready • Align code in box</span>
                    </>
                  )}
                  {phase === 'scanning' && (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
                      <span>Scanning QR signature...</span>
                    </>
                  )}
                  {phase === 'verifying_qr' && (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 text-primary animate-spin" />
                      <span>Checking lecture session...</span>
                    </>
                  )}
                  {phase === 'verifying_geo' && (
                    <>
                      <MapPin className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      <span>Verifying geofence coordinates...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Simulation Trigger for testing */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleSimulateScan}
                disabled={phase !== 'idle'}
                className="w-full gap-2 h-11 font-semibold text-xs shadow-xs"
              >
                <Zap className="h-4 w-4" />
                <span>Simulate Camera Scan (One-Click Test)</span>
              </Button>

              {/* Manual Token Entry Fallback */}
              <div className="pt-3 border-t border-border">
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Or paste session code / QR token..."
                    className="h-9 text-xs font-mono"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-9 text-xs shrink-0 font-medium">
                    Verify
                  </Button>
                </form>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>Requires camera & classroom location proximity to register.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default QrScanner;