import * as React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClearFilters?: () => void;
  showClear?: boolean;
}

const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ className, children, onClearFilters, showClear = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4 p-4 border border-border rounded bg-surface-secondary/20 md:flex-row md:items-center justify-between',
          className
        )}
        {...props}
      >
        <div className="flex flex-wrap items-center gap-3 flex-grow">
          <div className="flex items-center text-text-secondary text-xs font-bold uppercase tracking-wider gap-1.5 flex-shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            {children}
          </div>
        </div>
        
        {showClear && onClearFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex-shrink-0 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    );
  }
);
FilterBar.displayName = 'FilterBar';

export { FilterBar };
