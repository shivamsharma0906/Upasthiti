import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  LogOut, 
  Moon, 
  Sun, 
  QrCode, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Calendar,
  Layers,
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Geofence Check Active',
      message: 'Classroom geofence 50m radius enforced for CS-301 session.',
      time: '10m ago',
      type: 'info',
      read: false
    },
    {
      id: 'n2',
      title: 'Attendance Alert',
      message: 'Computer Networks is currently at 68%. Attend upcoming sessions to recover 75%.',
      time: '2h ago',
      type: 'warning',
      read: false
    },
    {
      id: 'n3',
      title: 'Session Verified',
      message: 'Data Structures attendance successfully registered via QR verification.',
      time: 'Yesterday',
      type: 'success',
      read: true
    }
  ]);

  if (!user) return null;

  // Determine breadcrumb / context
  const getContextInfo = () => {
    const p = location.pathname;
    if (p === '/student') return { title: 'Academic Overview', group: 'Student Portal' };
    if (p === '/student/attendance') return { title: 'Attendance Log & Analytics', group: 'Student Portal' };
    if (p === '/student/performance') return { title: 'Performance Metrics', group: 'Student Portal' };
    if (p === '/student/assignments') return { title: 'Assignments', group: 'Student Portal' };
    if (p === '/student/materials') return { title: 'Course Materials', group: 'Student Portal' };
    if (p === '/teacher') return { title: 'Faculty Operations', group: 'Instructor Portal' };
    if (p.includes('/teacher/students')) return { title: 'Enrolled Students', group: 'Instructor Portal' };
    if (p.includes('/teacher/upasthiti')) return { title: 'Attendance Management', group: 'Instructor Portal' };
    if (p === '/admin') return { title: 'Institution Governance', group: 'Administrative Control' };
    if (p === '/admin/students') return { title: 'Student Directory', group: 'Administrative Control' };
    if (p === '/admin/teachers') return { title: 'Faculty Directory', group: 'Administrative Control' };
    if (p === '/admin/classes') return { title: 'Course Offerings', group: 'Administrative Control' };
    if (p === '/admin/system') return { title: 'System Diagnostics & Audit', group: 'Administrative Control' };
    if (p === '/qr-scanner') return { title: 'Live QR Scanner', group: 'Attendance Handshake' };
    return { title: 'Dashboard', group: 'Upasthiti' };
  };

  const context = getContextInfo();
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Breadcrumbs & Page Context */}
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/" className="md:hidden shrink-0">
          <img src="/उpasthiti_SVG.svg" alt="Upasthiti" className="h-7 w-7 object-contain" />
        </Link>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium truncate">{context.group}</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            <span className="text-foreground font-semibold truncate">{context.title}</span>
          </div>
          <h1 className="text-sm font-bold font-heading text-foreground tracking-tight truncate hidden sm:block">
            {context.title}
          </h1>
        </div>
      </div>

      {/* Right: Contextual Actions & User Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Contextual primary action based on role */}
        {user.role === 'student' && location.pathname !== '/qr-scanner' && (
          <Button
            onClick={() => navigate('/qr-scanner')}
            size="sm"
            className="gap-1.5 h-8 font-semibold text-xs shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="sm:hidden">Scan</span>
          </Button>
        )}

        {user.role === 'teacher' && (
          <Button
            onClick={() => navigate('/teacher/upasthiti?mode=modal&active=schedule')}
            size="sm"
            className="gap-1.5 h-8 font-semibold text-xs shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Session</span>
            <span className="sm:hidden">Session</span>
          </Button>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-elevated" align="end">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold font-heading text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Mark read
                </button>
              )}
            </div>
            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-3 text-xs flex gap-2.5 transition-colors",
                    !n.read ? "bg-muted/40" : "hover:bg-muted/20"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Info className="h-3.5 w-3.5 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground leading-tight">{n.title}</p>
                    <p className="text-muted-foreground mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground/70 mt-1 inline-block font-mono">
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-md hover:bg-muted/70 transition-colors focus:outline-hidden focus:ring-1 focus:ring-ring">
              <Avatar className="h-7 w-7 border border-border">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">
                  {user.role}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1.5 p-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold leading-none text-foreground">{user.name}</p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </span>
                </div>
                <p className="text-[11px] leading-none text-muted-foreground font-mono truncate">
                  {user.email}
                </p>
                {user.role === 'student' && user.rollNumber && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono pt-0.5">
                    <span className="text-foreground/70">Roll No:</span>
                    <span className="font-semibold text-foreground">{user.rollNumber}</span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (user.role === 'student') navigate('/student/profile');
                else if (user.role === 'teacher') navigate('/teacher');
                else navigate('/admin/system');
              }}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {user.role === 'student' ? 'Academic Profile' : 'My Profile'}
                </span>
                <span className="text-[10px] text-muted-foreground">View & manage profile data</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (user.role === 'student') navigate('/student');
                else if (user.role === 'teacher') navigate('/teacher');
                else navigate('/admin/system');
              }}
              className="text-xs cursor-pointer gap-2 py-2"
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Workspace Portal</span>
                <span className="text-[10px] text-muted-foreground">Dashboard & operations</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer gap-2 py-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};