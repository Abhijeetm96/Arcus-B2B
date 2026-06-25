/**
 * ARCUS Wrapper
 *
 * Wraps the official shadcn component.
 *
 * Keep all ARCUS-specific styling,
 * helper props,
 * variants,
 * enterprise behaviours,
 * and compatibility adapters here.
 *
 * The corresponding *-base.tsx file
 * should remain identical to the
 * official shadcn CLI output whenever possible.
 */

import * as React from 'react';
import * as PaginationBase from './pagination-base';
import { cn } from './utils';

export interface PaginationProps extends React.ComponentPropsWithoutRef<typeof PaginationBase.Pagination> {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination = React.forwardRef<
  React.ElementRef<typeof PaginationBase.Pagination>,
  PaginationProps
>(({ className, currentPage, totalPages, onPageChange, totalItems, itemsPerPage, children, ...props }, ref) => {
  // If legacy props are provided, render the backward-compatible paging controls
  if (currentPage !== undefined && totalPages !== undefined && onPageChange !== undefined) {
    if (totalPages <= 1) return null;

    const startIdx = (currentPage - 1) * (itemsPerPage || 10) + 1;
    const endIdx = Math.min(startIdx + (itemsPerPage || 10) - 1, totalItems || 0);

    return (
      <PaginationBase.Pagination
        ref={ref}
        className={cn("flex flex-col gap-4 sm:flex-row sm:items-center justify-between py-4 border-t border-border mt-6 text-sm text-text-secondary w-full", className)}
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
        <PaginationBase.PaginationContent className="flex items-center gap-1">
          <PaginationBase.PaginationItem>
            <PaginationBase.PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={cn("h-8 text-xs font-semibold", currentPage === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationBase.PaginationItem>

          <PaginationBase.PaginationItem>
            <span className="px-2 text-xs font-bold uppercase tracking-wider text-text-secondary select-none">
              Page {currentPage} of {totalPages}
            </span>
          </PaginationBase.PaginationItem>

          <PaginationBase.PaginationItem>
            <PaginationBase.PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={cn("h-8 text-xs font-semibold", currentPage === totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationBase.PaginationItem>
        </PaginationBase.PaginationContent>
      </PaginationBase.Pagination>
    );
  }

  // Otherwise, render normal children layout
  return (
    <PaginationBase.Pagination ref={ref} className={className} {...props}>
      {children}
    </PaginationBase.Pagination>
  );
});

Pagination.displayName = 'Pagination';

// Re-export all subcomponents
const PaginationContent = PaginationBase.PaginationContent;
const PaginationItem = PaginationBase.PaginationItem;
const PaginationLink = PaginationBase.PaginationLink;
const PaginationPrevious = PaginationBase.PaginationPrevious;
const PaginationNext = PaginationBase.PaginationNext;
const PaginationEllipsis = PaginationBase.PaginationEllipsis;

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
