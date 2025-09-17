import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Users, AlertTriangle, ChevronLeft, ChevronRight, GraduationCap, Clock } from "lucide-react";
import React from "react";

interface UpasthitiSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'pending-approvals', label: 'Pending Approvals', icon: Clock },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'attendance-alerts', label: 'Attendance Alerts', icon: AlertTriangle },
];

export const UpasthitiSidebar = ({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed
}: UpasthitiSidebarProps) => {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg text-foreground">उpasthiti</h2>
              <p className="text-xs text-muted-foreground">Teacher Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("w-5 h-5", collapsed && "w-6 h-6")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};