import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  trendLabel?: string;
  statusBadge?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel = "vs last month",
  statusBadge,
  className
}) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-lg p-5 shadow-subtle hover:border-border/80 transition-all duration-150 flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="h-8 w-8 rounded-md bg-muted/60 dark:bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight font-heading tabular-nums text-foreground">
          {value}
        </div>
        {statusBadge}
      </div>

      {(description || trend !== undefined) && (
        <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          {description && <span className="truncate">{description}</span>}
          {trend !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 font-medium shrink-0 ml-auto tabular-nums",
                trend > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              )}
            >
              {trend > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : trend < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trend)}%</span>
              <span className="text-muted-foreground font-normal ml-0.5">{trendLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};