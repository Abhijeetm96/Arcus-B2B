import * as React from 'react';
import { cn } from '../ui/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4 md:flex-row md:items-center justify-between pb-6 border-b border-border',
          className
        )}
        {...props}
      >
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase">{title}</h1>
          {description && (
            <p className="text-xs text-text-secondary font-medium tracking-wide">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { PageHeader };
