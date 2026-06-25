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
import * as AvatarBase from './avatar-base';
import { cn } from './utils';

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarBase.Avatar> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarBase.Avatar>,
  AvatarProps
>(({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <AvatarBase.Avatar
      ref={ref}
      className={cn(
        "bg-border font-semibold text-text-secondary items-center justify-center select-none shadow-sm",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <AvatarBase.AvatarImage
        src={src}
        alt={alt || "Avatar"}
        className="h-full w-full object-cover aspect-square"
      />
      <AvatarBase.AvatarFallback
        className="flex h-full w-full items-center justify-center bg-border uppercase text-text-primary rounded-full"
        delayMs={600}
      >
        {fallback || alt?.substring(0, 2) || "U"}
      </AvatarBase.AvatarFallback>
    </AvatarBase.Avatar>
  );
});
Avatar.displayName = 'Avatar';

export { Avatar };
export * as AvatarBase from './avatar-base';
export { AvatarImage, AvatarFallback } from './avatar-base';
