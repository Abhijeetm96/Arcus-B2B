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
import { cn } from './utils';

// Import Sheet components for reuse and backward compatibility exports
import {
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
} from './Sheet';

const Drawer = Sheet;
const DrawerTrigger = SheetTrigger;
const DrawerClose = SheetClose;
const DrawerPortal = SheetPortal;
const DrawerOverlay = SheetOverlay;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent>
>(({ className, children, ...props }, ref) => (
  <SheetContent
    ref={ref}
    side="bottom"
    className={cn(
      'rounded-t-xl border-t border-border',
      className
    )}
    {...props}
  >
    {/* Mobile drawer handle bar indicator */}
    <div className="mx-auto h-1.5 w-16 rounded-full bg-border mb-4 sm:hidden" />
    {children}
  </SheetContent>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = SheetHeader;
const DrawerFooter = SheetFooter;
const DrawerTitle = SheetTitle;
const DrawerDescription = SheetDescription;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,

  // Re-export Sheet components for backward compatibility with '../ui/Drawer' imports
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
