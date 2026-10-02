import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  User, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  IdCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

export const StudentProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Form State
  const [name, setName] = useState(user?.name || '');
  const [personalEmail, setPersonalEmail] = useState(user?.personalEmail || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Academic fields
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [program, setProgram] = useState(user?.program || '');
  const [year, setYear] = useState(user?.year || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [section, setSection] = useState(user?.section || '');
  const [academicSession, setAcademicSession] = useState(user?.academicSession || '');

  // Keep state synced when user prop updates
  const resetForm = () => {
    setName(user?.name || '');
    setPersonalEmail(user?.personalEmail || '');
    setPhone(user?.phone || '');
    setAvatar(user?.avatar || '');
    setRollNumber(user?.rollNumber || '');
    setDepartment(user?.department || '');
    setProgram(user?.program || '');
    setYear(user?.year || '');
    setSemester(user?.semester || '');
    setSection(user?.section || '');
    setAcademicSession(user?.academicSession || '');
    setErrorMessage('');
    setIsEditing(false);
  };

  const studentInitials = useMemo(() => {
    if (!user?.name?.trim()) return 'ST';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMessage('University Roll Number is required.');
      return;
    }
    if (!department) {
      setErrorMessage('Please select your Academic Department.');
      return;
    }
    if (!program) {
      setErrorMessage('Please select your Program/Course.');
      return;
    }
    if (!year) {
      setErrorMessage('Please select your Academic Year.');
      return;
    }
    if (!semester) {
      setErrorMessage('Please select your Semester.');
      return;
    }
    if (!section) {
      setErrorMessage('Please select your Section.');
      return;
    }
    if (!academicSession) {
      setErrorMessage('Please select your Academic Session.');
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
          title: "Profile Updated Successfully",
          description: "Your academic and personal information have been saved.",
        });
        setIsEditing(false);
      } else {
        setErrorMessage(result.error || 'Failed to update academic profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMessage(err?.message || 'Network error occurred while saving profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <button 
              onClick={() => navigate('/student')} 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </button>
            <span>/</span>
            <span className="text-foreground font-semibold">Academic Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <IdCard className="h-6 w-6 text-primary" />
            Student Identity & Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official institutional enrollment records, university credentials, and contact details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
                disabled={isSubmitting}
                className="gap-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveProfile}
                disabled={isSubmitting}
                className="gap-1.5 text-xs bg-primary text-primary-foreground shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs shadow-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. MAIN GRID: DIGITAL ID CARD (LEFT) + DETAILS FORM/VIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DIGITAL CAMPUS IDENTITY CARD */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-card to-muted/30 p-6 shadow-sm">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <img src="/उpasthiti_SVG.svg" alt="Upasthiti" className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold tracking-wider uppercase text-foreground">
                  Upasthiti 2.0
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                Verified Student
              </Badge>
            </div>

            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center pt-6 pb-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md bg-muted flex items-center justify-center">
                  {(isEditing ? avatar : user?.avatar) ? (
                    <img 
                      src={isEditing ? avatar : user?.avatar} 
                      alt={user?.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center font-mono">
                      {studentInitials}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md hover:bg-primary/90 transition-transform active:scale-95"
                    title="Change Profile Photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleAvatarFile} 
                  className="hidden" 
                />
              </div>

              <h2 className="text-base font-bold text-foreground mt-3">
                {user?.name || 'Student Name'}
              </h2>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                {user?.email}
              </p>

              {/* Roll Number Highlight Box */}
              <div className="mt-4 w-full bg-muted/60 border border-border/80 rounded-xl p-3 text-center">
                <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-medium">
                  University Roll Number
                </div>
                <div className="text-base font-bold font-mono text-foreground mt-0.5 tracking-wide">
                  {user?.rollNumber || (
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-normal">
                      Not assigned yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Card Attributes */}
            <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Department</span>
                <span className="font-semibold text-foreground text-right max-w-[160px] truncate">
                  {user?.department || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Course / Degree</span>
                <span className="font-semibold text-foreground">
                  {user?.program || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Academic Year</span>
                <span className="font-semibold text-foreground">
                  {user?.year || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Semester & Section</span>
                <span className="font-semibold text-foreground font-mono">
                  {user?.semester ? `${user.semester} • ${user.section || '—'}` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Academic Session</span>
                <span className="font-semibold text-foreground font-mono">
                  {user?.academicSession || '—'}
                </span>
              </div>
            </div>

            {/* Bottom Institutional Seal */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                VERIFIED ID
              </span>
              <span className="font-mono text-[10px] uppercase">
                Upasthiti Registry
              </span>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Institutional Identity Policy
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Your college email is assigned by the university registrar and cannot be modified directly. For email change requests, contact academic administration.
            </p>
          </div>
        </div>

        {/* PROFILE DETAILS (VIEW / EDIT FORM) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* 1. ACADEMIC CREDENTIALS */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Academic Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official university registration, department, and semester placement.
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Read-Only
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Roll Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="rollNumber" className="text-xs font-semibold">
                      University Roll Number <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="rollNumber"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 13030824051"
                        className="font-mono text-xs"
                        required
                      />
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center font-mono text-xs font-semibold text-foreground">
                        {user?.rollNumber || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Department...</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-medium text-foreground truncate">
                        {user?.department || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Program / Course */}
                  <div className="space-y-1.5">
                    <Label htmlFor="program" className="text-xs font-semibold">
                      Program / Degree <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="program"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Program...</option>
                        {PROGRAMS.map((prog) => (
                          <option key={prog} value={prog}>{prog}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-medium text-foreground">
                        {user?.program || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="text-xs font-semibold">
                      Academic Year <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Year...</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-medium text-foreground">
                        {user?.year || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Semester */}
                  <div className="space-y-1.5">
                    <Label htmlFor="semester" className="text-xs font-semibold">
                      Current Semester <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Semester...</option>
                        {SEMESTERS.map((sem) => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-medium text-foreground font-mono">
                        {user?.semester || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Section */}
                  <div className="space-y-1.5">
                    <Label htmlFor="section" className="text-xs font-semibold">
                      Section <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Section...</option>
                        {SECTIONS.map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-medium text-foreground">
                        {user?.section || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>

                  {/* Academic Session */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="academicSession" className="text-xs font-semibold">
                      Academic Session <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <select
                        id="academicSession"
                        value={academicSession}
                        onChange={(e) => setAcademicSession(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                        required
                      >
                        <option value="">Select Session...</option>
                        {ACADEMIC_SESSIONS.map((sess) => (
                          <option key={sess} value={sess}>{sess}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-mono font-medium text-foreground">
                        {user?.academicSession || <span className="text-muted-foreground font-normal">Not assigned yet</span>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. PERSONAL & CONTACT DETAILS */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal & Contact Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Your identity details and communication channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-xs"
                        required
                      />
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-semibold text-foreground">
                        {user?.name || '—'}
                      </div>
                    )}
                  </div>

                  {/* Institutional Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="collegeEmail" className="text-xs font-semibold">
                        College Email (Institutional)
                      </Label>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono text-primary bg-primary/5">
                        Read-Only
                      </Badge>
                    </div>
                    <div className="h-9 px-3 rounded-md bg-muted/60 border border-border flex items-center text-xs font-mono text-muted-foreground truncate">
                      {user?.email || '—'}
                    </div>
                  </div>

                  {/* Personal Email (Optional) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="personalEmail" className="text-xs font-semibold">
                      Personal Email <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="personalEmail"
                        type="email"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="text-xs"
                      />
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs text-foreground">
                        {user?.personalEmail || <span className="text-muted-foreground italic">Not provided</span>}
                      </div>
                    )}
                  </div>

                  {/* Phone Number (Optional) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="text-xs font-mono"
                      />
                    ) : (
                      <div className="h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center text-xs font-mono text-foreground">
                        {user?.phone || <span className="text-muted-foreground italic">Not provided</span>}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={isSubmitting}
                      className="text-xs gap-1.5 bg-primary text-primary-foreground"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. ENROLLMENT & SYSTEM METRICS */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  System & Registry Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[11px]">System Role</span>
                    <p className="font-semibold capitalize text-foreground">{user?.role || 'student'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[11px]">Account Status</span>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[11px]">Profile Status</span>
                    <p className="font-semibold text-foreground">
                      {user?.rollNumber ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[11px]">Registry Auth</span>
                    <p className="font-semibold font-mono text-muted-foreground truncate" title={user?.id}>
                      {user?.id ? user.id.slice(0, 12) + '...' : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
