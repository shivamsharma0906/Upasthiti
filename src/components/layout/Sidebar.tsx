import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Home,
  Calendar,
  Upload,
  UserCheck,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const studentRoutes = [
  { name: 'Dashboard', path: '/student', icon: Home },
  { name: 'Assignments', path: '/student/assignments', icon: FileText },
  { name: 'Attendance', path: '/student/attendance', icon: Calendar },
  { name: 'Materials', path: '/student/materials', icon: BookOpen },
  { name: 'Performance', path: '/student/performance', icon: BarChart3 },
];

const teacherRoutes = [
  { name: 'Dashboard', path: '/teacher', icon: Home },
  { name: 'Pending Approvals', path: '/teacher/upasthiti?mode=modal&active=pending-approvals', icon: Clock },
  { name: 'Schedule', path: '/teacher/upasthiti?mode=modal&active=schedule', icon: Calendar },
  { name: 'Attendance Alerts', path: '/teacher/upasthiti?mode=modal&active=attendance-alerts', icon: Shield },
  { name: 'Students', path: '/teacher/students', icon: Users },
];

const adminRoutes = [
  { name: 'Dashboard', path: '/admin', icon: Home },
  { name: 'Students', path: '/admin/students', icon: GraduationCap },
  { name: 'Teachers', path: '/admin/teachers', icon: Users },
  { name: 'Classes', path: '/admin/classes', icon: BookOpen },
  { name: 'System', path: '/admin/system', icon: Shield },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const routes = user.role === 'student' ? studentRoutes 
    : user.role === 'teacher' ? teacherRoutes 
    : adminRoutes;

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg">उpasthiti</h2>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                collapsed && "justify-center"
              )}
            >
              <route.icon className={cn("w-5 h-5", collapsed && "w-6 h-6")} />
              {!collapsed && <span className="font-medium">{route.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};