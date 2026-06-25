import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, error, checked, defaultChecked, onChange, disabled, id, ...props }, ref) => {
  const uniqueId = id || React.useId();

  const handleCheckedChange = (val: CheckboxPrimitive.CheckedState) => {
    if (onChange) {
      onChange(val === true);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={uniqueId}
        className={cn(
          "flex items-center gap-3 cursor-pointer select-none text-sm text-text-primary font-medium",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          id={uniqueId}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className={cn(
            "peer h-5 w-5 shrink-0 rounded border border-border bg-surface transition-all duration-200 flex items-center justify-center shadow-sm",
            "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && <span>{label}</span>}
      </label>
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
