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
import { Input as InputBase } from './input-base';
import { Textarea as TextareaBase } from './textarea-base';
import { cn } from './utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  isLoading?: boolean;
  sizeVariant?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      label,
      helperText,
      prefixIcon,
      suffixIcon,
      isLoading = false,
      sizeVariant = 'md',
      showPasswordToggle = true,
      id,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const uniqueId = id || React.useId();

    const isPassword = type === 'password';
    const currentType = isPassword && isPasswordVisible ? 'text' : type;

    // Check if we should display password toggle
    const displayPasswordToggle = isPassword && showPasswordToggle && !isLoading;

    const sizeClasses = {
      sm: 'h-8 px-2 text-xs rounded-sm',
      md: 'h-10 px-3 text-sm rounded',
      lg: 'h-12 px-4 text-base rounded-md',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={uniqueId}
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-xs"
          >
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center justify-center text-text-secondary pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <InputBase
            type={currentType}
            id={uniqueId}
            className={cn(
              'border-border bg-surface text-text-primary placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-2',
              prefixIcon && 'pl-10',
              (suffixIcon || displayPasswordToggle || isLoading) && 'pr-10',
              sizeClasses[sizeVariant],
              error && 'border-danger focus-visible:ring-danger',
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute right-3 flex items-center gap-1.5 text-text-secondary">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && suffixIcon}
            {!isLoading && displayPasswordToggle && (
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="hover:text-text-primary transition-colors focus:outline-none"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
        {helperText && !error && <span className="mt-1 block text-xs text-text-secondary">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      label,
      helperText,
      showCharacterCount = false,
      maxLength,
      resize = 'vertical',
      id,
      ...props
    },
    ref
  ) => {
    const uniqueId = id || React.useId();
    const [charCount, setCharCount] = React.useState(
      typeof props.value === 'string'
        ? props.value.length
        : typeof props.defaultValue === 'string'
        ? props.defaultValue.length
        : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        <div className="flex justify-between items-baseline mb-xs">
          {label && (
            <label
              htmlFor={uniqueId}
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider"
            >
              {label}
              {props.required && <span className="text-danger ml-0.5">*</span>}
            </label>
          )}
          {showCharacterCount && maxLength && (
            <span className="text-[10px] font-medium text-text-secondary">
              {charCount} / {maxLength}
            </span>
          )}
        </div>
        <TextareaBase
          id={uniqueId}
          maxLength={maxLength}
          className={cn(
            'border-border bg-surface text-text-primary placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-2',
            resizeClasses[resize],
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
        {helperText && !error && <span className="mt-1 block text-xs text-text-secondary">{helperText}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
