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
import * as FormBase from './form-base';
import { cn } from './utils';

// Re-export hook form context and primitives
export { useFormField } from './form-base';
export const Form = FormBase.Form;
export const FormField = FormBase.FormField;
export const FormItem = FormBase.FormItem;
export const FormControl = FormBase.FormControl;

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormBase.FormLabel>,
  React.ComponentPropsWithoutRef<typeof FormBase.FormLabel>
>(({ className, ...props }, ref) => {
  const { error } = FormBase.useFormField();

  return (
    <FormBase.FormLabel
      ref={ref}
      className={cn(
        'block text-xs font-semibold text-text-secondary uppercase tracking-wider',
        error && 'text-danger',
        className
      )}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <FormBase.FormDescription
    ref={ref}
    className={cn('text-xs text-text-secondary', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <FormBase.FormMessage
    ref={ref}
    className={cn('text-xs font-medium text-danger', className)}
    {...props}
  />
));
FormMessage.displayName = 'FormMessage';

export {
  FormLabel,
  FormDescription,
  FormMessage,
};
