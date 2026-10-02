import React from 'react';
import { cn } from '@/lib/utils';
import { getAttendanceStatus } from '@/lib/attendanceStatus';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  sublabel?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  sublabel = 'Attendance',
  className
}) => {
  const status = getAttendanceStatus(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  const strokeColor =
    status.tier === 'healthy'
      ? 'hsl(var(--primary))'
      : status.tier === 'warning'
      ? 'hsl(var(--warning))'
      : 'hsl(var(--danger))';

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/60 dark:text-muted/30"
        />
        {/* Value circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-xl sm:text-2xl font-bold font-heading tabular-nums tracking-tight text-foreground">
            {Math.round(percentage * 10) / 10}%
          </span>
          {sublabel && (
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
