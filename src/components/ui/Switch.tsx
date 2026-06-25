import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from './utils';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, error, checked, defaultChecked, onChange, disabled, id, ...props }, ref) => {
  const uniqueId = id || React.useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={uniqueId}
        className={cn(
          "flex items-center gap-3 cursor-pointer select-none text-sm text-text-primary font-medium",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <SwitchPrimitive.Root
          ref={ref}
          id={uniqueId}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "bg-border data-[state=checked]:bg-primary",
            className
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-surface shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitive.Root>
        {label && <span>{label}</span>}
      </label>
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  );
});
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
