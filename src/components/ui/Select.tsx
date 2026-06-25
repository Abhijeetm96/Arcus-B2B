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
import * as SelectBase from './select-base';
import { cn } from './utils';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange'> {
  error?: string;
  label?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      error,
      label,
      options,
      placeholder,
      id,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      name
    },
    ref
  ) => {
    const uniqueId = id || React.useId();

    const handleValueChange = (newValue: string) => {
      if (onChange) {
        // Construct a synthetic event that mirrors the standard HTMLSelectElement's event shape
        const syntheticEvent = {
          target: {
            name: name || '',
            value: newValue,
          },
          currentTarget: {
            name: name || '',
            value: newValue,
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;

        onChange(syntheticEvent);
      }
    };

    // Convert value and defaultValue to string as required by Radix Select
    const selectValue = value !== undefined ? value.toString() : undefined;
    const selectDefaultValue = defaultValue !== undefined ? defaultValue.toString() : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={uniqueId}
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-xs"
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <SelectBase.Select
          value={selectValue}
          defaultValue={selectDefaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectBase.SelectTrigger
            ref={ref}
            id={uniqueId}
            className={cn(
              'border-border bg-surface text-text-primary focus:ring-primary focus:ring-offset-2',
              error && 'border-danger focus:ring-danger',
              className
            )}
          >
            <SelectBase.SelectValue placeholder={placeholder} />
          </SelectBase.SelectTrigger>
          <SelectBase.SelectContent className="bg-popover border-border text-popover-foreground">
            {options.map((opt) => (
              <SelectBase.SelectItem
                key={opt.value}
                value={opt.value.toString()}
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {opt.label}
              </SelectBase.SelectItem>
            ))}
          </SelectBase.SelectContent>
        </SelectBase.Select>
        {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export {
  Select,
  SelectBase,
};

// Re-export subcomponents for flexibility
export {
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select-base';
