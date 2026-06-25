import * as React from 'react';
import { cn } from '../ui/utils';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative border-l border-border pl-6 space-y-8 ml-3', className)} {...props}>
        {items.map((item) => {
          const statusBgMap = {
            default: 'bg-border text-text-secondary border-border',
            success: 'bg-success/20 text-success border-success/40',
            warning: 'bg-warning/20 text-warning border-warning/40',
            danger: 'bg-danger/20 text-danger border-danger/40',
            info: 'bg-info/20 text-info border-info/40',
          };

          const activeStatus = item.status || 'default';

          return (
            <div key={item.id} className="relative">
              {/* Circle Marker */}
              <div
                className={cn(
                  'absolute -left-[38px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border bg-surface text-xs shadow-sm',
                  statusBgMap[activeStatus]
                )}
              >
                {item.icon ? (
                  item.icon
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex flex-col space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                  <span className="text-xs text-text-secondary font-medium">{item.timestamp}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);
Timeline.displayName = 'Timeline';

export { Timeline };
