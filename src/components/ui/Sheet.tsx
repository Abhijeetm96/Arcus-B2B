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
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as SheetBase from './sheet-base';
import { cn } from './utils';

const Sheet = SheetBase.Sheet;
const SheetTrigger = SheetBase.SheetTrigger;
const SheetClose = SheetBase.SheetClose;
const SheetPortal = SheetBase.SheetPortal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetBase.SheetOverlay>,
  React.ComponentPropsWithoutRef<typeof SheetBase.SheetOverlay>
>(({ className, ...props }, ref) => (
  <SheetBase.SheetOverlay
    ref={ref}
    className={cn(
      'bg-black/60 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetBase.SheetContent> {
  showClose?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetBase.SheetContent>,
  SheetContentProps
>(({ className, children, side = 'right', showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 bg-surface p-6 shadow border-border transition ease-in-out duration-300 max-w-md w-full',
        side === 'top' && 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        side === 'bottom' && 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[85vh]',
        side === 'left' && 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        side === 'right' && 'inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4 text-text-secondary" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-left mb-4', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetBase.SheetTitle>,
  React.ComponentPropsWithoutRef<typeof SheetBase.SheetTitle>
>(({ className, ...props }, ref) => (
  <SheetBase.SheetTitle
    ref={ref}
    className={cn('text-lg font-bold text-text-primary leading-none tracking-tight', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetBase.SheetDescription>,
  React.ComponentPropsWithoutRef<typeof SheetBase.SheetDescription>
>(({ className, ...props }, ref) => (
  <SheetBase.SheetDescription
    ref={ref}
    className={cn('text-sm text-text-secondary mt-1', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
