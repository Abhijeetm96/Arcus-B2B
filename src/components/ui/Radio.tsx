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
import { RadioGroup, RadioGroupItem } from './radio-group-base';
import { cn } from './utils';

export interface RadioProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupItem>, 'value' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  name?: string;
  value?: string;
  onChange?: () => void;
}

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioProps
>(({ className, label, description, error, checked, disabled, id, name, onChange, value, ...props }, ref) => {
  const uniqueId = id || React.useId();

  return (
    <RadioGroup
      value={checked ? (value || 'selected') : ''}
      onValueChange={() => onChange?.()}
      disabled={disabled}
      name={name}
      className="grid"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <RadioGroupItem
            ref={ref}
            id={uniqueId}
            value={value || 'selected'}
            disabled={disabled}
            className={cn(
              checked && 'border-primary',
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
                <p className={cn('text-xs text-text-secondary', disabled && 'opacity-50')}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-danger font-medium ml-8">{error}</span>}
      </div>
    </RadioGroup>
  );
});
Radio.displayName = 'Radio';

export { Radio };

// Also export the base group components for standard shadcn radio groups
export { RadioGroup as RadioGroupBase, RadioGroupItem as RadioGroupItemBase } from './radio-group-base';
