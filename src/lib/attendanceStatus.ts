import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, PlayCircle, CheckCircle } from 'lucide-react';

export type AttendanceTier = 'healthy' | 'warning' | 'critical';

export interface AttendanceStatusInfo {
  tier: AttendanceTier;
  label: string;
  shortLabel: string;
  percentage: number;
  badgeClass: string;
  dotClass: string;
  textClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const INSTITUTIONAL_MIN_ATTENDANCE = 75; // 75% mandatory threshold

/**
 * Returns deterministic status object according to institutional criteria
 */
export function getAttendanceStatus(percentage: number): AttendanceStatusInfo {
  const rounded = Math.round(percentage * 10) / 10;

  if (rounded >= INSTITUTIONAL_MIN_ATTENDANCE) {
    return {
      tier: 'healthy',
      label: 'On track',
      shortLabel: 'On track',
      percentage: rounded,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      dotClass: 'bg-emerald-500',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
      description: 'Meets institutional requirement'
    };
  }

  if (rounded >= 65) {
    return {
      tier: 'warning',
      label: 'Needs attention',
      shortLabel: 'Attention',
      percentage: rounded,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
      icon: AlertCircle,
      description: 'At risk of debarment'
    };
  }

  return {
    tier: 'critical',
    label: 'Below requirement',
    shortLabel: 'Critical',
    percentage: rounded,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    icon: AlertTriangle,
    description: 'Immediate action required'
  };
}

/**
 * Calculate classes needed to reach 75% or classes that can be missed safely
 */
export function getAttendanceAdvice(attended: number, total: number) {
  if (total === 0) return { type: 'neutral', message: 'No classes held yet' };

  const currentRate = (attended / total) * 100;

  if (currentRate < INSTITUTIONAL_MIN_ATTENDANCE) {
    // How many consecutive classes must be attended to reach 75%?
    // (attended + x) / (total + x) >= 0.75  =>  x >= 3*total - 4*attended
    const needed = Math.max(1, Math.ceil(3 * total - 4 * attended));
    return {
      type: 'recovery',
      needed,
      message: `Attend next ${needed} ${needed === 1 ? 'class' : 'classes'} to reach 75%`
    };
  } else {
    // How many classes can be missed before falling below 75%?
    // attended / (total + m) >= 0.75  =>  0.75 * m <= attended - 0.75*total
    const canMiss = Math.floor(Math.max(0, (attended - 0.75 * total) / 0.75));
    return {
      type: 'safe',
      canMiss,
      message: canMiss > 0
        ? `Can safely miss ${canMiss} ${canMiss === 1 ? 'class' : 'classes'}`
        : 'On threshold: do not miss upcoming classes'
    };
  }
}

export type SessionState = 'live' | 'upcoming' | 'completed' | 'cancelled';

export interface SessionStatusInfo {
  state: SessionState;
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getSessionStatus(startTime: string, endTime: string, dateStr?: string): SessionStatusInfo {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const targetDate = dateStr || todayStr;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startDt = new Date(targetDate);
  startDt.setHours(startH, startM, 0, 0);

  const endDt = new Date(targetDate);
  endDt.setHours(endH, endM, 0, 0);

  if (targetDate === todayStr && now >= startDt && now <= endDt) {
    return {
      state: 'live',
      label: 'LIVE',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
      icon: PlayCircle
    };
  }

  if (now < startDt) {
    return {
      state: 'upcoming',
      label: 'Upcoming',
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700',
      icon: Clock
    };
  }

  return {
    state: 'completed',
    label: 'Completed',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800',
    icon: CheckCircle
  };
}
