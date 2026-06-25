import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, currentPage, totalPages, onPageChange, totalItems, itemsPerPage, ...props }, ref) => {
    if (totalPages <= 1) return null;

    const startIdx = (currentPage - 1) * (itemsPerPage || 10) + 1;
    const endIdx = Math.min(startIdx + (itemsPerPage || 10) - 1, totalItems || 0);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4 sm:flex-row sm:items-center justify-between py-4 border-t border-border mt-6 text-sm text-text-secondary',
          className
        )}
        {...props}
      >
        <div>
          {totalItems && itemsPerPage ? (
            <p>
              Showing <span className="font-semibold text-text-primary">{startIdx}</span> to{' '}
              <span className="font-semibold text-text-primary">{endIdx}</span> of{' '}
              <span className="font-semibold text-text-primary">{totalItems}</span> entries
            </p>
          ) : (
            <p>
              Page <span className="font-semibold text-text-primary">{currentPage}</span> of{' '}
              <span className="font-semibold text-text-primary">{totalPages}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-text-secondary">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    );
  }
);
Pagination.displayName = 'Pagination';

export { Pagination };
