import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  QrCode,
  UserCheck,
  Camera,
  Plus,
  Pencil,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";

interface ScheduledSession {
  id: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  department: string;
  subject: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const Schedule = () => {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"menu" | "qr" | "manual" | "face">("menu");

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    department: "",
    subject: "",
    startDate: "",
    durationMonths: 6,
  });

  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [editTimes, setEditTimes] = useState<{ startTime: string; endTime: string }>({ startTime: "", endTime: "" });
  const [manualStudentId, setManualStudentId] = useState("");
  type AttendanceLog = { id: string; studentId: string; time: string; method: "manual" | "qr" | "face" };
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);

  const [qrValue, setQrValue] = useState("");
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [locationPermissionError, setLocationPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }
    if (viewMode === "face" && selectedSession) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode, selectedSession]);

  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Chemical",
  ];

  const authHeader = () => {
    const token = localStorage.getItem('ems_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions as ScheduledSession[]);
    } catch {}
  };

  useEffect(() => { loadSessions(); }, []);

  const addMonths = (dateStr: string, months: number) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== day) d.setDate(0);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        department: formData.department,
        subject: formData.subject,
        startDate: formData.startDate,
        endDate: addMonths(formData.startDate, formData.durationMonths),
      };
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to create session');
      const data = await res.json();
      setSessions((prev) => [...prev, data.session as ScheduledSession]);
      setFormData({ startTime: "", endTime: "", department: "", subject: "", startDate: "", durationMonths: 6 });
      setShowForm(false);
      toast({ title: 'Session Scheduled', description: 'New session has been added.' });
    } catch {
      toast({ title: 'Error', description: 'Could not create session.' });
    }
  };

  const canEditToday = (session: ScheduledSession) => {
    const today = new Date().toISOString().split("T")[0];
    return session.startDate <= today && today <= session.endDate;
  };

  const startEdit = (session: ScheduledSession) => {
    if (!canEditToday(session)) return;
    setEditSessionId(session.id);
    setEditTimes({ startTime: session.startTime, endTime: session.endTime });
  };

  const saveEdit = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, startTime: editTimes.startTime, endTime: editTimes.endTime } : s)));
    setEditSessionId(null);
    toast({ title: "Updated", description: "Today's class time updated." });
  };

  const generateQR = async (sessionId: string) => {
    setLocationPermissionError(null);
    let lat: number | undefined;
    let lng: number | undefined;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        );
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      } catch {
        setLocationPermissionError("Location denied. QR will work without proximity.");
      }
    }
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ lat, lng, radius: lat && lng ? 75 : undefined })
      });
      if (!res.ok) throw new Error('Failed to generate QR');
      const data = await res.json();
      const token = data.token as string;
      const url = new URL(`${window.location.origin}/qr-scanner`);
      url.searchParams.set('session', sessionId);
      url.searchParams.set('token', token);
      if (lat && lng) { url.searchParams.set('lat', String(lat)); url.searchParams.set('lng', String(lng)); url.searchParams.set('radius', String(75)); }
      setQrValue(url.toString());
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      setExpiryTime(expiry);
    } catch {
      toast({ title: 'Error', description: 'Failed to generate QR token.' });
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      const diff = expiryTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setQrValue("");
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Schedule</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Session
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card mb-6">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-heading text-primary">Schedule New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Enter subject" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={String(formData.durationMonths)} onValueChange={(v) => setFormData({ ...formData, durationMonths: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,3,5,6,9,12].map((m) => (
                        <SelectItem key={m} value={String(m)}>{m} months</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input readOnly value={formData.startDate ? addMonths(formData.startDate, formData.durationMonths) : ""} placeholder="Auto-calculated" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">Schedule Session</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="glass-card cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl group" onClick={() => setSelectedSession(session.id)}>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-lg font-bold font-heading text-primary">{session.startTime} - {session.endTime}</span>
                  <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button type="button" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); if (canEditToday(session)) { startEdit(session); } }} title={canEditToday(session) ? "Edit today's time" : "Editable only during active period"}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-medium text-foreground">{session.subject}</h3>
                <p className="text-sm text-muted-foreground">{session.department}</p>
                <p className="text-xs text-muted-foreground">{session.startDate} → {session.endDate}</p>
                {editSessionId === session.id && (
                  <div className="mt-2 p-3 border rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-start-${session.id}`}>Start</Label>
                        <Input id={`edit-start-${session.id}`} type="time" value={editTimes.startTime} onChange={(e) => setEditTimes({ ...editTimes, startTime: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-end-${session.id}`}>End</Label>
                        <Input id={`edit-end-${session.id}`} type="time" value={editTimes.endTime} onChange={(e) => setEditTimes({ ...editTimes, endTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); saveEdit(session.id); }}>Save</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditSessionId(null); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Attendance</DialogTitle>
          </DialogHeader>

          {viewMode === "menu" && (
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => { setViewMode("qr"); generateQR(selectedSession!); }} className="h-20 flex-col gap-2" variant="outline">
                <QrCode className="w-6 h-6" />
                Generate QR
              </Button>
              <Button onClick={() => setViewMode("manual" )} className="h-20 flex-col gap-2" variant="outline">
                <UserCheck className="w-6 h-6" />
                Manual Entry
              </Button>
              <Button onClick={() => setViewMode("face")} className="h-20 flex-col gap-2" variant="outline">
                <Camera className="w-6 h-6" />
                Face Recognition
              </Button>
            </div>
          )}

          {viewMode === "qr" && (
            <div className="flex flex-col items-center justify-center gap-4">
              {qrValue ? (
                <>
                  <QRCode value={qrValue} size={200} />
                  <p className="text-sm text-muted-foreground">Expires in: <span className="font-bold">{timeLeft}</span> sec</p>
                  {locationPermissionError && (<p className="text-xs text-red-500">{locationPermissionError}</p>)}
                </>
              ) : (
                <p className="text-red-500 font-semibold">QR Expired</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => generateQR(selectedSession!)}>Regenerate QR</Button>
                <Button variant="outline" onClick={() => setViewMode("menu")}>Back</Button>
              </div>
            </div>
          )}

          {viewMode === "manual" && (
            <div className="space-y-4">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); /* integrate backend manual endpoint in future */ }}>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" placeholder="Enter Student ID" value={manualStudentId} onChange={(e) => setManualStudentId(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setViewMode("menu")}>Back</Button>
                </div>
              </form>
            </div>
          )}

          {viewMode === "face" && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 border border-primary/20 pointer-events-none rounded-xl animate-pulse" />
                <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Live Camera Feed
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewMode("menu")} className="w-full h-11 rounded-xl">Back</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
