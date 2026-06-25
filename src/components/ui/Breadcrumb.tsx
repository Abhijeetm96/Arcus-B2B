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
import * as BreadcrumbBase from './breadcrumb-base';
import { cn } from './utils';

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<typeof BreadcrumbBase.Breadcrumb> {
  items?: BreadcrumbItemType[];
}

const Breadcrumb = React.forwardRef<
  React.ElementRef<typeof BreadcrumbBase.Breadcrumb>,
  BreadcrumbProps
>(({ className, items, children, ...props }, ref) => {
  // If items array is provided, render backward-compatible structure
  if (items && items.length > 0) {
    return (
      <BreadcrumbBase.Breadcrumb ref={ref} className={className} {...props}>
        <BreadcrumbBase.BreadcrumbList className="flex flex-wrap items-center gap-1.5 break-words text-xs font-semibold uppercase tracking-wider text-text-secondary sm:gap-2.5">
          <BreadcrumbBase.BreadcrumbItem>
            <BreadcrumbBase.BreadcrumbLink href="#/" className="hover:text-primary transition-colors duration-200">
              <span className="sr-only">Home</span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </BreadcrumbBase.BreadcrumbLink>
          </BreadcrumbBase.BreadcrumbItem>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <BreadcrumbBase.BreadcrumbSeparator className="text-muted" />
              <BreadcrumbBase.BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbBase.BreadcrumbLink
                    href={item.href}
                    className="hover:text-primary transition-colors duration-200 truncate max-w-[120px] md:max-w-none"
                  >
                    {item.label}
                  </BreadcrumbBase.BreadcrumbLink>
                ) : (
                  <BreadcrumbBase.BreadcrumbPage className="text-text-primary font-bold truncate max-w-[120px] md:max-w-none">
                    {item.label}
                  </BreadcrumbBase.BreadcrumbPage>
                )}
              </BreadcrumbBase.BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbBase.BreadcrumbList>
      </BreadcrumbBase.Breadcrumb>
    );
  }

  // Otherwise, render normal children layout
  return (
    <BreadcrumbBase.Breadcrumb ref={ref} className={className} {...props}>
      {children}
    </BreadcrumbBase.Breadcrumb>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

// Re-export all sub-components with standard styling wrappers
const BreadcrumbList = BreadcrumbBase.BreadcrumbList;
const BreadcrumbItem = BreadcrumbBase.BreadcrumbItem;

const BreadcrumbLink = React.forwardRef<
  React.ElementRef<typeof BreadcrumbBase.BreadcrumbLink>,
  React.ComponentPropsWithoutRef<typeof BreadcrumbBase.BreadcrumbLink>
>(({ className, ...props }, ref) => (
  <BreadcrumbBase.BreadcrumbLink
    ref={ref}
    className={cn("hover:text-primary transition-all duration-200", className)}
    {...props}
  />
));
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  React.ElementRef<typeof BreadcrumbBase.BreadcrumbPage>,
  React.ComponentPropsWithoutRef<typeof BreadcrumbBase.BreadcrumbPage>
>(({ className, ...props }, ref) => (
  <BreadcrumbBase.BreadcrumbPage
    ref={ref}
    className={cn("text-text-primary font-bold", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = BreadcrumbBase.BreadcrumbSeparator;
const BreadcrumbEllipsis = BreadcrumbBase.BreadcrumbEllipsis;

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
