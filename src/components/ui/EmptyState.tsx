import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border/80 rounded-lg bg-card/40 my-4",
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-muted/70 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold font-heading text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
