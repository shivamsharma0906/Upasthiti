import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

const PROGRAMS = [
  "B.Tech",
  "M.Tech",
  "BCA",
  "MCA",
  "B.Sc Computer Science",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

const SECTIONS = [
  "Section A",
  "Section B",
  "Section C",
  "Section D",
];

const ACADEMIC_SESSIONS = [
  "2026-2027",
  "2025-2026",
  "2024-2025",
];

export const CompleteProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Personal fields
  const [name, setName] = useState(user?.name || '');
  const [personalEmail, setPersonalEmail] = useState(user?.personalEmail || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Academic fields (NO fake / default values!)
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [program, setProgram] = useState(user?.program || '');
  const [year, setYear] = useState(user?.year || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [section, setSection] = useState(user?.section || '');
  const [academicSession, setAcademicSession] = useState(user?.academicSession || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Student initials for avatar fallback
  const initials = useMemo(() => {
    if (!name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Explicit client-side validation for all required fields
    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMsg('University Roll Number is required.');
      return;
    }
    if (!department) {
      setErrorMsg('Please select your Academic Department.');
      return;
    }
    if (!program) {
      setErrorMsg('Please select your Program/Course.');
      return;
    }
    if (!year) {
      setErrorMsg('Please select your Academic Year.');
      return;
    }
    if (!semester) {
      setErrorMsg('Please select your Semester.');
      return;
    }
    if (!section) {
      setErrorMsg('Please select your Section.');
      return;
    }
    if (!academicSession) {
      setErrorMsg('Please select your Academic Session.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile({
        name: name.trim(),
        personalEmail: personalEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
        rollNumber: rollNumber.trim(),
        department,
        program,
        year,
        semester,
        section,
        academicSession,
      });

      if (result.success) {
        toast({
          title: "Academic Profile Completed",
          description: "Your institutional profile has been verified and registered.",
        });
        navigate('/student', { replace: true });
      } else {
        setErrorMsg(result.error || 'Failed to update academic profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Profile completion error:', err);
      setErrorMsg(err?.message || 'Network error occurred while saving profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header with Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-card rounded-xl flex items-center justify-center border border-border shadow-xs">
              <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold font-heading text-lg text-foreground tracking-tight">उpasthiti</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  2.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Institutional Academic Enrollment</p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Step Context Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h1 className="text-sm sm:text-base font-bold text-foreground">
              Complete Your Academic Profile
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Institutional policy requires full identity and academic batch assignment before lecture attendance, 
              geofence scanning, and the Student Dashboard can be accessed.
            </p>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. PERSONAL INFORMATION CARD */}
          <Card className="border border-border bg-card shadow-subtle">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>1. Personal Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Confirm your student identity and optional contact channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Profile Photo Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-3 border-b border-border/50">
                <div className="h-16 w-16 rounded-full border-2 border-border bg-primary/10 text-primary font-bold flex items-center justify-center text-lg shrink-0 font-mono overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="avatarUpload" className="text-xs font-semibold">Profile Photo (Optional)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Upload a recognizable portrait. If no photo is provided, your initials ({initials}) will be used.
                  </p>
                  <Input 
                    id="avatarUpload"
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="h-8 text-xs file:text-xs file:mr-2 file:py-0 file:px-2 max-w-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <Input
                    id="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shivam Sharma"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                {/* College Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collegeEmail" className="text-xs font-semibold">College Email</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Institutional ID</span>
                  </div>
                  <Input
                    id="collegeEmail"
                    value={user?.email || ''}
                    disabled
                    className="h-9 text-xs bg-muted/50 cursor-not-allowed font-mono text-muted-foreground"
                  />
                </div>

                {/* Personal Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="personalEmail" className="text-xs font-semibold">Personal Email (Optional)</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="e.g. personal@gmail.com"
                    className="h-9 text-xs"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. ACADEMIC INFORMATION CARD */}
          <Card className="border border-border bg-card shadow-subtle">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>2. Academic Allocation & Batch Details</span>
              </CardTitle>
              <CardDescription className="text-xs">
                All fields below are strictly required for classroom geofence pairing and attendance verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* University Roll Number (Manual text entry) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rollNumber" className="text-xs font-semibold">University Roll Number</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <Input
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 24CSE1042 or CS-2024-042"
                    className="h-9 text-xs font-mono"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Must match your official university examination and enrollment card.
                  </p>
                </div>

                {/* Department (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="department" className="text-xs font-semibold">Department</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Department --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Program / Course (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="program" className="text-xs font-semibold">Program / Course</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="program"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Program/Course --</option>
                    {PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>

                {/* Academic Year (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="year" className="text-xs font-semibold">Current Year</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Year --</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Semester (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="semester" className="text-xs font-semibold">Semester</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Semester --</option>
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                {/* Section (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="section" className="text-xs font-semibold">Class Section</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Section --</option>
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Academic Session (Select) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="academicSession" className="text-xs font-semibold">Academic Session</Label>
                    <span className="text-[10px] text-primary font-medium">Required</span>
                  </div>
                  <select
                    id="academicSession"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Academic Session --</option>
                    {ACADEMIC_SESSIONS.map((sess) => (
                      <option key={sess} value={sess}>{sess}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              By saving, you certify that all academic batch credentials provided are accurate.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 text-xs font-semibold gap-2 shadow-xs shrink-0"
            >
              <span>{isSubmitting ? "Saving Profile..." : "Save Academic Profile & Enter Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CompleteProfile;
