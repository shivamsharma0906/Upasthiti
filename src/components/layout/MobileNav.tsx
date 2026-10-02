import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CalendarCheck, 
  QrCode, 
  BookOpen, 
  Users, 
  Settings, 
  Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'student';
  const isTeacher = user.role === 'teacher';

  const navItems = isStudent
    ? [
        { label: 'Overview', path: '/student', icon: Home },
        { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
        { label: 'Scan QR', path: '/qr-scanner', icon: QrCode, isPrimaryAction: true },
        { label: 'Subjects', path: '/student/subjects', icon: BookOpen },
        { label: 'Performance', path: '/student/performance', icon: Layers },
      ]
    : isTeacher
    ? [
        { label: 'Overview', path: '/teacher', icon: Home },
        { label: 'Sessions', path: '/teacher/upasthiti?mode=modal&active=schedule', icon: CalendarCheck },
        { label: 'Live QR', path: '/teacher/upasthiti?mode=modal&active=schedule', icon: QrCode, isPrimaryAction: true },
        { label: 'Students', path: '/teacher/students', icon: Users },
        { label: 'Alerts', path: '/teacher/upasthiti?mode=modal&active=attendance-alerts', icon: Layers },
      ]
    : [
        { label: 'Overview', path: '/admin', icon: Home },
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Teachers', path: '/admin/teachers', icon: Layers },
        { label: 'Classes', path: '/admin/classes', icon: BookOpen },
        { label: 'System', path: '/admin/system', icon: Settings },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-3 py-1.5 shadow-lg safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isPrimaryAction) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center -mt-5 relative group",
                    isActive ? "text-primary" : "text-foreground"
                  )
                }
              >
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center transition-transform active:scale-95 group-hover:scale-105 border-2 border-background">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight mt-1 text-primary">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/teacher' || item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[56px]",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.2px]")} />
                  <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
