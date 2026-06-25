import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from './utils';

export interface RadioProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  name?: string;
  value?: string;
  onChange?: () => void;
}

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ className, label, error, checked, disabled, id, name, onChange, value, ...props }, ref) => {
  const uniqueId = id || React.useId();

  return (
    <RadioGroupPrimitive.Root
      value={checked ? (value || "selected") : ""}
      onValueChange={() => onChange?.()}
      disabled={disabled}
      name={name}
      className="grid"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor={uniqueId}
          className={cn(
            "flex items-center gap-3 cursor-pointer select-none text-sm text-text-primary font-medium",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <RadioGroupPrimitive.Item
            ref={ref}
            id={uniqueId}
            value={value || "selected"}
            disabled={disabled}
            className={cn(
              "aspect-square h-5 w-5 rounded-full border border-border bg-surface text-primary shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              checked && "border-primary",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-primary" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          {label && <span>{label}</span>}
        </label>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    </RadioGroupPrimitive.Root>
  );
});
Radio.displayName = "Radio";

export { Radio };
