import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/theme-constants';

import { HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[#00FFAD] text-gray-900 hover:bg-[#00FF8C] focus:ring-[#00FFAD] font-semibold shadow-lg shadow-[#00FFAD]/20',
      secondary: 'glass-button-primary',
      ghost: 'bg-transparent text-gray-300 hover:text-[#00FFAD] hover:bg-white/5 focus:ring-[#00FFAD]/20',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      outline: 'border border-[#00FFAD] text-[#00FFAD] hover:bg-[#00FFAD]/10 focus:ring-[#00FFAD]/20',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg',
    };
    
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';