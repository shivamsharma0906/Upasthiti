import React from 'react';
import { cn } from '@/lib/utils';
import { getAttendanceStatus, getSessionStatus, AttendanceTier } from '@/lib/attendanceStatus';

interface AttendanceBadgeProps {
  percentage: number;
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({
  percentage,
  showIcon = true,
  showPercentage = false,
  size = 'md',
  className
}) => {
  const status = getAttendanceStatus(percentage);
  const Icon = status.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border shrink-0 transition-colors",
        status.badgeClass,
        size === 'sm' ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />}
      <span className="font-semibold">{status.label}</span>
      {showPercentage && (
        <span className="tabular-nums font-mono opacity-80 border-l border-current/20 pl-1 ml-0.5">
          {Math.round(percentage)}%
        </span>
      )}
    </span>
  );
};

interface SessionBadgeProps {
  startTime: string;
  endTime: string;
  dateStr?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const SessionBadge: React.FC<SessionBadgeProps> = ({
  startTime,
  endTime,
  dateStr,
  size = 'md',
  className
}) => {
  const status = getSessionStatus(startTime, endTime, dateStr);
  const Icon = status.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border shrink-0",
        status.badgeClass,
        size === 'sm' ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
        status.state === 'live' && "font-bold tracking-wide",
        className
      )}
    >
      {status.state === 'live' ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
      ) : (
        <Icon className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
      <span>{status.label}</span>
    </span>
  );
};
