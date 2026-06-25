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
import * as TooltipBase from './tooltip-base';
import { cn } from './utils';

const TooltipProvider = TooltipBase.TooltipProvider;
const TooltipTrigger = TooltipBase.TooltipTrigger;

interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipBase.Tooltip> {
  delayDuration?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ delayDuration = 300, ...props }) => (
  <TooltipBase.Tooltip delayDuration={delayDuration} {...props} />
);
Tooltip.displayName = 'Tooltip';

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipBase.TooltipContent>,
  React.ComponentPropsWithoutRef<typeof TooltipBase.TooltipContent>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipBase.TooltipContent
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'bg-neutral-900 border-neutral-800 text-white text-xs px-2.5 py-1.5 shadow-md',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
