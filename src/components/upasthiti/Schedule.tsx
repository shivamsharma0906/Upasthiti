import { useState, useEffect } from "react";
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

const LOCAL_STORAGE_KEY = "scheduledSessions";
const ATTENDANCE_KEY = "attendanceLogsBySession";

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
  // Load sessions from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed: ScheduledSession[] = JSON.parse(raw);
        setSessions(parsed);
      }
    } catch (err) {
      console.error("Failed to load sessions from localStorage", err);
    }
  }, []);

  // Persist sessions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error("Failed to persist sessions to localStorage", err);
    }
  }, [sessions]);


  const [qrValue, setQrValue] = useState("");
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [locationPermissionError, setLocationPermissionError] = useState<string | null>(null);

  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Chemical",
  ];

  // Generate QR with 5-min expiry and embed location (lat,lng,radiusMeters)
  const generateQR = (sessionId: string) => {
    setLocationPermissionError(null);
    const ensureUrl = (lat?: number, lng?: number) => {
      const params = new URLSearchParams({
        session: sessionId,
        t: String(Date.now()),
      });
      if (typeof lat === "number" && typeof lng === "number") {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
        params.set("radius", String(75)); // meters
      }
      const newQR = `${window.location.origin}/qr-scanner?${params.toString()}`;
      setQrValue(newQR);
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      setExpiryTime(expiry);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => ensureUrl(pos.coords.latitude, pos.coords.longitude),
        () => {
          setLocationPermissionError("Location denied. QR will work without proximity.");
          ensureUrl();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      ensureUrl();
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      const diff = expiryTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setQrValue(""); // Expire QR
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  const addMonths = (dateStr: string, months: number) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: ScheduledSession = {
      id: Date.now().toString(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      department: formData.department,
      subject: formData.subject,
      startDate: formData.startDate,
      endDate: addMonths(formData.startDate, formData.durationMonths),
    };

    setSessions([...sessions, newSession]);
    setFormData({ startTime: "", endTime: "", department: "", subject: "", startDate: "", durationMonths: 6 });
    setShowForm(false);
    toast({
      title: "Session Scheduled",
      description: "New session has been added to your schedule.",
    });
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
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

  // Attendance logs: load when session changes
  useEffect(() => {
    if (!selectedSession) return;
    try {
      const raw = localStorage.getItem(ATTENDANCE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, AttendanceLog[]>) : {};
      setAttendanceLogs(map[selectedSession] || []);
    } catch (err) {
      console.error("Failed to load attendance logs", err);
      setAttendanceLogs([]);
    }
  }, [selectedSession]);

  const persistLogs = (sessionId: string, logs: AttendanceLog[]) => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, AttendanceLog[]>) : {};
      map[sessionId] = logs;
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to persist attendance logs", err);
    }
  };

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

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Enter subject"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={String(formData.durationMonths)}
                    onValueChange={(v) => setFormData({ ...formData, durationMonths: Number(v) })}
                  >
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
                  <Input
                    readOnly
                    value={formData.startDate ? addMonths(formData.startDate, formData.durationMonths) : ""}
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit">Schedule Session</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => setSelectedSession(session.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    {session.startTime} - {session.endTime}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); if (canEditToday(session)) { startEdit(session); } }}
                      title={canEditToday(session) ? "Edit today's time" : "Editable only during active period"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-medium text-foreground">{session.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.department}
                </p>
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

      {/* Attendance Options */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={() => setSelectedSession(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Attendance</DialogTitle>
          </DialogHeader>

          {viewMode === "menu" && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  setViewMode("qr");
                  generateQR(selectedSession!);
                }}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                <QrCode className="w-6 h-6" />
                Generate QR
              </Button>

              <Button
                onClick={() => setViewMode("manual")}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                <UserCheck className="w-6 h-6" />
                Manual Entry
              </Button>

              <Button
                onClick={() => setViewMode("face")}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
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
                  <p className="text-sm text-muted-foreground">
                    Expires in: <span className="font-bold">{timeLeft}</span> sec
                  </p>
                  {locationPermissionError && (
                    <p className="text-xs text-red-500">{locationPermissionError}</p>
                  )}
                </>
              ) : (
                <p className="text-red-500 font-semibold">QR Expired</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => generateQR(selectedSession!)}
                >
                  Regenerate QR
                </Button>
                <Button variant="outline" onClick={() => setViewMode("menu")}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {viewMode === "manual" && (
            <div className="space-y-4">
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedSession || !manualStudentId.trim()) return;
                  const entry = {
                    id: Date.now().toString(),
                    studentId: manualStudentId.trim(),
                    time: new Date().toLocaleTimeString(),
                    method: "manual" as const,
                  };
                  const updated = [...attendanceLogs, entry];
                  setAttendanceLogs(updated);
                  persistLogs(selectedSession, updated);
                  setManualStudentId("");
                  toast({ title: "Marked", description: `Attendance recorded for ${entry.studentId}.` });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" placeholder="Enter Student ID" value={manualStudentId} onChange={(e) => setManualStudentId(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setViewMode("menu")}>Back</Button>
                </div>
              </form>

              <div className="pt-2">
                <h4 className="font-medium mb-2">Attendance Log</h4>
                {attendanceLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No entries yet.</p>
                ) : (
                  <ul className="space-y-1 max-h-48 overflow-auto">
                    {attendanceLogs.map((log) => (
                      <li key={log.id} className="text-sm flex items-center justify-between border rounded px-2 py-1">
                        <span>Roll {log.studentId} marked at {log.time}</span>
                        <span className="text-xs text-muted-foreground uppercase">{log.method}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {viewMode === "face" && (
            <div className="space-y-4">
              <div className="mt-1 border p-6 rounded bg-gray-100 text-center">
                📷 Camera feed placeholder
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewMode("menu")}>Back</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
