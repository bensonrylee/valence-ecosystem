import React, { forwardRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  floatingLabel?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      floatingLabel = true,
      type = 'text',
      disabled = false,
      required = false,
      id: providedId,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const generatedId = useId();
    const inputId = providedId || generatedId;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const showFloatingLabel = floatingLabel && label;
    const shouldFloat = focused || hasValue || !!props.value || !!props.defaultValue;

    return (
      <div className="relative">
        {/* Floating Label Container */}
        <div className="relative">
          {/* Icon Left */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              'w-full px-4 py-3 bg-white border rounded-lg',
              'text-gray-900 text-base font-normal',
              'transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              
              // Border styles
              error
                ? 'border-red-500 focus:ring-red-500'
                : focused
                ? 'border-blue-600 focus:ring-blue-500'
                : 'border-gray-200 hover:border-gray-300',
              
              // Icon padding
              icon && iconPosition === 'left' && 'pl-11',
              icon && iconPosition === 'right' && 'pr-11',
              
              // Floating label padding
              showFloatingLabel && 'pt-6 pb-2',
              
              // States
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              
              // Custom className
              className
            )}
            placeholder={showFloatingLabel && shouldFloat ? placeholder : (!showFloatingLabel ? (placeholder || label) : '')}
            disabled={disabled}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {showFloatingLabel && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-4 transition-all duration-300 ease-out pointer-events-none',
                'origin-left select-none',
                
                // Positioning and size
                shouldFloat
                  ? 'top-2 text-xs font-medium'
                  : 'top-1/2 -translate-y-1/2 text-base font-normal',
                
                // Icon adjustment
                icon && iconPosition === 'left' && shouldFloat && 'left-11',
                icon && iconPosition === 'left' && !shouldFloat && 'left-11',
                
                // Colors
                error
                  ? 'text-red-600'
                  : focused
                  ? 'text-blue-600'
                  : shouldFloat
                  ? 'text-gray-600'
                  : 'text-gray-400',
                
                // Required indicator
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </label>
          )}

          {/* Icon Right */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;