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
import * as PopoverBase from './popover-base';
import { cn } from './utils';

const Popover = PopoverBase.Popover;
const PopoverTrigger = PopoverBase.PopoverTrigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverBase.PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverBase.PopoverContent>
>(({ className, ...props }, ref) => (
  <PopoverBase.PopoverContent
    ref={ref}
    className={cn(
      'bg-surface border-border text-text-primary shadow-xl p-4 focus-visible:ring-primary',
      className
    )}
    {...props}
  />
));
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
