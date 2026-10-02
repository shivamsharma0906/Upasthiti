import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CalendarCheck, 
  BookOpen, 
  Users, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  Settings, 
  FileText, 
  QrCode, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  User,
  Bell,
  Calendar,
  Megaphone,
  FileCheck,
  FileClock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const studentGroups: NavGroup[] = [
    {
      groupTitle: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/student', icon: Home },
        { name: 'Notifications', path: '/student/notifications', icon: Bell },
      ]
    },
    {
      groupTitle: 'ACADEMIC',
      items: [
        { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
        { name: 'Scan Attendance', path: '/qr-scanner', icon: QrCode, badge: 'Live' },
        { name: 'Timetable', path: '/student/timetable', icon: Calendar },
        { name: 'Subjects', path: '/student/subjects', icon: BookOpen },
        { name: 'Performance', path: '/student/performance', icon: BarChart3 },
      ]
    },
    {
      groupTitle: 'LEARNING',
      items: [
        { name: 'Assignments', path: '/student/assignments', icon: FileText },
        { name: 'Course Materials', path: '/student/materials', icon: BookOpen },
        { name: 'Announcements', path: '/student/announcements', icon: Megaphone },
      ]
    },
    {
      groupTitle: 'SERVICES',
      items: [
        { name: 'Leave Requests', path: '/student/leave-requests', icon: FileCheck },
        { name: 'Attendance Correction', path: '/student/attendance-correction', icon: FileClock },
      ]
    },
    {
      groupTitle: 'ACCOUNT',
      items: [
        { name: 'My Profile', path: '/student/profile', icon: User },
        { name: 'Settings', path: '/student/settings', icon: Settings },
      ]
    }
  ];

  const teacherGroups: NavGroup[] = [
    {
      groupTitle: 'Operations',
      items: [
        { name: 'Dashboard', path: '/teacher', icon: Home },
        { name: 'Sessions & Schedule', path: '/teacher/upasthiti?mode=modal&active=schedule', icon: CalendarCheck },
        { name: 'Enrolled Students', path: '/teacher/students', icon: Users },
      ]
    },
    {
      groupTitle: 'Monitoring',
      items: [
        { name: 'Attendance Alerts', path: '/teacher/upasthiti?mode=modal&active=attendance-alerts', icon: Layers, badge: 'Watch' },
        { name: 'Pending Approvals', path: '/teacher/upasthiti?mode=modal&active=pending-approvals', icon: Clock },
      ]
    }
  ];

  const adminGroups: NavGroup[] = [
    {
      groupTitle: 'Academic Operations',
      items: [
        { name: 'Institution Overview', path: '/admin', icon: Home },
        { name: 'Classes & Courses', path: '/admin/classes', icon: BookOpen },
        { name: 'Timetable Builder', path: '/admin/timetables', icon: Calendar },
        { name: 'Student Roster', path: '/admin/students', icon: GraduationCap },
        { name: 'Faculty Directory', path: '/admin/teachers', icon: Users },
      ]
    },
    {
      groupTitle: 'System & Governance',
      items: [
        { name: 'System Health & Audit', path: '/admin/system', icon: ShieldCheck },
      ]
    }
  ];

  const navGroups = user.role === 'student' ? studentGroups : user.role === 'teacher' ? teacherGroups : adminGroups;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-card text-card-foreground border-r border-border transition-all duration-200 shrink-0 z-30 select-none",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Institution Brand Header */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/उpasthiti_SVG.svg"
                alt="Upasthiti Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="font-heading font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                  UPASTHITI
                  <span className="text-[10px] uppercase font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    2.0
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Apex Institute of Tech
                </span>
              </div>
            </div>
          ) : (
            <img
              src="/उpasthiti_SVG.svg"
              alt="Upasthiti Logo"
              className="mx-auto h-8 w-8 object-contain shrink-0"
            />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "h-7 w-7 rounded-md border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Collapsed expand trigger button at top */}
        {collapsed && (
          <div className="py-2 flex justify-center border-b border-border/40">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;

                if (item.disabled) {
                  const disabledNode = (
                    <div
                      key={item.name}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground/50 cursor-not-allowed select-none group relative",
                        collapsed && "justify-center px-0"
                      )}
                      title={`${item.name} (Coming Soon)`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      {!collapsed && (
                        <span className="truncate flex-1 text-muted-foreground/60">{item.name}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground/70 border border-border/40">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{disabledNode}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">
                          {item.name} (Coming Soon)
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return disabledNode;
                }

                const isActive = location.pathname === item.path;

                const linkNode = (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/student' || item.path === '/teacher' || item.path === '/admin'}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                        isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary font-semibold"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkNode;
              })}
            </div>
          ))}
        </div>

        {/* User Profile Mini Footer */}
        <div className="p-3 border-t border-border bg-card/60">
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20 overflow-hidden font-mono">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize truncate">
                  {user.role === 'student' && user.rollNumber ? `#${user.rollNumber}` : `${user.role} Account`}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};