import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  Save, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Notification Preferences State (Persisted)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Security / Password Change State (Persisted)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const token = localStorage.getItem('ems_token');
        const res = await fetch(`${API_BASE}/settings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setEmailNotifications(Boolean(data.settings.emailNotifications));
            setAttendanceAlerts(Boolean(data.settings.attendanceAlerts));
            setAssignmentReminders(Boolean(data.settings.assignmentReminders));
            setAnnouncementAlerts(Boolean(data.settings.announcementAlerts));
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  // Save notification preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          emailNotifications,
          attendanceAlerts,
          assignmentReminders,
          announcementAlerts,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Preferences Saved',
          description: 'Your notification preferences have been persisted to your account.',
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Could not update preferences. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Failed to communicate with settings service.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Form Incomplete',
        description: 'Please enter your current password and new password.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'New password must contain at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Password Updated Successfully',
          description: 'Your account credentials have been updated securely.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Security Error',
          description: data.error || 'Failed to verify current password.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Failed to communicate with authentication service.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
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
            <span>Account</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Settings</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Account & Security Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your persistent institutional preferences, notification alerts, and security credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. NOTIFICATION PREFERENCES (Persisted) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Notification & Alert Preferences
              </h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Persisted</span>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Email Notifications
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Receive administrative notices and circulars via college email.
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Attendance Threshold Alerts
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Alert me when any course attendance falls below mandatory 75%.
                </p>
              </div>
              <Switch
                checked={attendanceAlerts}
                onCheckedChange={setAttendanceAlerts}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Assignment Reminders
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Reminders for pending laboratory submissions and coursework due dates.
                </p>
              </div>
              <Switch
                checked={assignmentReminders}
                onCheckedChange={setAssignmentReminders}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Departmental Announcements
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Notify on urgent examination circulars and schedule modifications.
                </p>
              </div>
              <Switch
                checked={announcementAlerts}
                onCheckedChange={setAnnouncementAlerts}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isSavingSettings}
                className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Preferences'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* 3. SECURITY & PASSWORD CHANGE (Persisted) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Security & Password Update
              </h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Encrypted</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Current Password
              </Label>
              <Input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                New Password
              </Label>
              <Input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Confirm New Password
              </Label>
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-9 text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isUpdatingPassword}
                className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. ACCOUNT & PROFILE SUMMARY (Read-only reference) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Institutional Profile Reference
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/profile')}
            className="h-7 text-xs"
          >
            <span>Manage Academic Profile</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Full Name</span>
            <p className="font-semibold text-foreground mt-0.5">{user?.name}</p>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Institutional Email</span>
            <p className="font-semibold text-foreground font-mono mt-0.5 truncate">{user?.email}</p>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Roll Number</span>
            <p className="font-semibold text-foreground font-mono mt-0.5">{user?.rollNumber || 'Not assigned yet'}</p>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Department</span>
            <p className="font-semibold text-foreground mt-0.5 truncate">{user?.department || 'Not assigned yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
