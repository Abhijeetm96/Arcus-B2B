import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../../../components/ui/utils';

interface EmptyStateContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyStateContainer({
  className,
  title,
  description,
  icon: Icon,
  action,
  ...props
}: EmptyStateContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border rounded bg-surface-secondary/20 min-h-[300px] animate-in fade-in duration-200',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-text-secondary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-text-primary text-base mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
}
