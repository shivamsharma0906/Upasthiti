import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: "border-border",
  primary: "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
  success: "border-success/20 bg-gradient-to-br from-success/5 to-success/10",
  warning: "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10"
};

const iconStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning"
};

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) => {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend !== undefined && (
          <div className={cn(
            "text-xs mt-1 font-medium",
            trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend > 0 ? "+" : ""}{trend}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
};