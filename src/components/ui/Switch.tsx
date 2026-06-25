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
import { Switch as SwitchBase } from './switch-base';
import { cn } from './utils';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<typeof SwitchBase>, 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  statusText?: {
    on: string;
    off: string;
  };
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchBase>,
  SwitchProps
>(({ className, label, description, error, checked, defaultChecked, onChange, disabled, id, statusText, ...props }, ref) => {
  const uniqueId = id || React.useId();
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleCheckedChange = (val: boolean) => {
    setInternalChecked(val);
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <SwitchBase
          ref={ref}
          id={uniqueId}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className={cn(
            'data-[state=checked]:bg-primary bg-border',
            error && 'border-danger focus-visible:ring-danger',
            'mt-0.5',
            className
          )}
          {...props}
        />
        {(label || description || statusText) && (
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
              <p className={cn('text-xs text-text-secondary', disabled && 'opacity-50')}>
                {description}
              </p>
            )}
            {statusText && (
              <span className={cn('text-xs font-semibold uppercase tracking-wider', isChecked ? 'text-primary' : 'text-text-secondary', disabled && 'opacity-50')}>
                {isChecked ? statusText.on : statusText.off}
              </span>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-danger font-medium ml-14">{error}</span>}
    </div>
  );
});
Switch.displayName = 'Switch';

export { Switch };
