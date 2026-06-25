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
import * as DropdownMenuBase from './dropdown-menu-base';
import { cn } from './utils';

const DropdownMenu = DropdownMenuBase.DropdownMenu;
const DropdownMenuTrigger = DropdownMenuBase.DropdownMenuTrigger;
const DropdownMenuGroup = DropdownMenuBase.DropdownMenuGroup;
const DropdownMenuPortal = DropdownMenuBase.DropdownMenuPortal;
const DropdownMenuSub = DropdownMenuBase.DropdownMenuSub;
const DropdownMenuRadioGroup = DropdownMenuBase.DropdownMenuRadioGroup;
const DropdownMenuShortcut = DropdownMenuBase.DropdownMenuShortcut;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuSubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuSubTrigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuSubTrigger
    ref={ref}
    className={cn(
      'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent',
      className
    )}
    {...props}
  />
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuSubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuSubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuSubContent
    ref={ref}
    className={cn(
      'bg-surface border-border text-text-primary shadow-xl p-1',
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuContent
    ref={ref}
    className={cn(
      'bg-surface border-border text-text-primary shadow-xl p-1',
      className
    )}
    {...props}
  />
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuItem
    ref={ref}
    className={cn(
      'focus:bg-primary focus:text-primary-foreground focus:font-medium transition-colors cursor-pointer',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuCheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuCheckboxItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuCheckboxItem
    ref={ref}
    className={cn(
      'focus:bg-accent focus:text-accent-foreground transition-colors cursor-pointer',
      className
    )}
    {...props}
  />
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuRadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuRadioItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuRadioItem
    ref={ref}
    className={cn(
      'focus:bg-accent focus:text-accent-foreground transition-colors cursor-pointer',
      className
    )}
    {...props}
  />
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuLabel>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuLabel
    ref={ref}
    className={cn(
      'text-xs font-bold text-text-secondary uppercase tracking-wider px-2 py-1.5',
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuBase.DropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuBase.DropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <DropdownMenuBase.DropdownMenuSeparator
    ref={ref}
    className={cn('bg-border my-1 h-px', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
