import React from 'react';
import { cn } from '@/lib/theme-constants';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    fullWidth = false,
    type = 'text',
    ...props 
  }, ref) => {
    const baseStyles = 'bg-white/5 backdrop-blur-sm border text-white placeholder-gray-400 rounded-lg px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-1';
    const errorStyles = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-white/10 focus:border-blue-400 focus:ring-blue-400';
    
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            errorStyles,
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';