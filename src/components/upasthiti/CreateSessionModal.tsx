import React, { useState } from 'react';
import { 
  X, 
  Play, 
  MapPin, 
  Clock, 
  BookOpen, 
  Users, 
  Check, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: {
    subject: string;
    code: string;
    room: string;
    totalEnrolled: number;
    department: string;
    radius: number;
  }) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [selectedClass, setSelectedClass] = useState('CS-301');
  const [room, setRoom] = useState('Room 204');
  const [duration, setDuration] = useState('60'); // minutes
  const [geofenceRadius, setGeofenceRadius] = useState('50'); // meters
  const [autoRotateSeconds, setAutoRotateSeconds] = useState('150'); // 2.5 min

  const availableClasses = [
    { code: 'CS-301', name: 'Data Structures & Algorithms', department: 'Computer Science', defaultRoom: 'Room 204', enrolled: 52 },
    { code: 'CS-302', name: 'Computer Networks', department: 'Computer Science', defaultRoom: 'Lab 3B', enrolled: 48 },
    { code: 'CS-303', name: 'Database Management Systems', department: 'Computer Science', defaultRoom: 'Room 102', enrolled: 55 },
    { code: 'MA-301', name: 'Discrete Mathematics', department: 'Mathematics', defaultRoom: 'Hall A', enrolled: 60 },
  ];

  const currentClassObj = availableClasses.find((c) => c.code === selectedClass) || availableClasses[0];

  const handleLaunch = () => {
    onSessionCreated({
      subject: currentClassObj.name,
      code: currentClassObj.code,
      room,
      totalEnrolled: currentClassObj.enrolled,
      department: currentClassObj.department,
      radius: Number(geofenceRadius) || 50,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-xl shadow-modal overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
              Create Attendance Session
            </h2>
            <p className="text-xs text-muted-foreground">
              Step {step} of 2: {step === 1 ? 'Select Course & Class' : 'Configure Geofence & Timer'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 text-center text-xs font-medium border-b border-border">
          <div
            className={cn(
              "py-2.5 border-b-2 transition-colors",
              step === 1 ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground"
            )}
          >
            1. Select Course
          </div>
          <div
            className={cn(
              "py-2.5 border-b-2 transition-colors",
              step === 2 ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground"
            )}
          >
            2. Configure Session
          </div>
        </div>

        {/* Step 1: Select Class */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Course</Label>
              <div className="space-y-2">
                {availableClasses.map((cls) => (
                  <div
                    key={cls.code}
                    onClick={() => {
                      setSelectedClass(cls.code);
                      setRoom(cls.defaultRoom);
                    }}
                    className={cn(
                      "p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between",
                      selectedClass === cls.code
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{cls.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">
                          {cls.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {cls.department} • Default: {cls.defaultRoom}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0 font-medium">
                      {cls.enrolled} Enrolled
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setStep(2)} className="h-9 px-4 text-xs font-semibold">
                <span>Continue to Configuration</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure Session */}
        {step === 2 && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Classroom / Room</Label>
                <Input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Duration</Label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md text-foreground"
                >
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>
            </div>

            {/* Geofence Configuration */}
            <div className="border border-border rounded-lg p-3.5 space-y-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">
                  Location Verification (Geofencing)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Prevents remote proxy attendance by enforcing GPS distance checks.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Allowed Radius</span>
                <select
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                  className="h-8 px-2 text-xs bg-background border border-border rounded-md font-mono"
                >
                  <option value="30">30 meters (Strict Classroom)</option>
                  <option value="50">50 meters (Standard Hall)</option>
                  <option value="100">100 meters (Department Wing)</option>
                </select>
              </div>
            </div>

            {/* Dynamic QR Expiration */}
            <div className="border border-border rounded-lg p-3.5 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">QR Dynamic Rotation</span>
                <span className="font-mono text-primary font-bold">
                  Every 2.5 minutes
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Automatically rotates cryptographic token to prevent students sharing screenshots.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="h-9 text-xs"
              >
                Back
              </Button>
              <Button
                onClick={handleLaunch}
                size="sm"
                className="gap-2 h-9 px-4 text-xs font-semibold shadow-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch Live QR Session</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
