/**
 * ARCUS Wrapper
 *
 * Wraps the official shadcn component.
 *
 * All ARCUS-specific styling,
 * helper props,
 * variants,
 * and behaviours belong here.
 *
 * The corresponding *-base.tsx file should remain
 * as close as possible to the official shadcn CLI output.
 */

import * as React from 'react';
import { Checkbox as CheckboxBase } from './checkbox-base';
import { cn } from './utils';

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxBase>, 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxBase>,
  CheckboxProps
>(({ className, label, description, error, checked, defaultChecked, onChange, disabled, id, ...props }, ref) => {
  const uniqueId = id || React.useId();

  const handleCheckedChange = (val: boolean | "indeterminate") => {
    if (onChange) {
      onChange(val === true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <CheckboxBase
          ref={ref}
          id={uniqueId}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className={cn(
            error && 'border-danger focus-visible:ring-danger',
            'mt-0.5',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="grid gap-1 select-none">
            {label && (
              <label
                htmlFor={uniqueId}
                className={cn(
                  'text-sm text-text-primary font-medium cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-xs text-text-secondary',
                disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-danger font-medium ml-8">{error}</span>}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
