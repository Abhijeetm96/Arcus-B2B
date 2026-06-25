import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

import { Skeleton } from '../ui/Skeleton';
export { Skeleton };

// 2. Empty State Component
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function EmptyState({ className, title, description, icon, action, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded bg-surface-secondary/10 min-h-[300px]',
        className
      )}
      {...props}
    />
  );
}

// 3. Loading State Page Placeholder
interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

function LoadingState({ className, text = 'Loading details...', ...props }: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 min-h-[200px]', className)}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{text}</p>
    </div>
  );
}

export { EmptyState, LoadingState };
