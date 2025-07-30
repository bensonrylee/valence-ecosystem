import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/ui-utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      ripple = true,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleProps[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Clear ripples after animation
    useEffect(() => {
      if (ripples.length > 0) {
        const timer = setTimeout(() => {
          setRipples([]);
        }, 600);
        return () => clearTimeout(timer);
      }
    }, [ripples]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback
      triggerHaptic(10);

      // Add ripple effect
      if (ripple && buttonRef.current && !disabled && !loading) {
        const rect = buttonRef.current.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        setRipples([...ripples, { x, y, size }]);
      }

      // Call original onClick
      if (onClick && !disabled && !loading) {
        onClick(e);
      }
    };

    const variants = {
      primary: cn(
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        'shadow-button hover:shadow-md'
      ),
      secondary: cn(
        'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
        'border border-gray-200'
      ),
      ghost: cn(
        'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200'
      ),
      danger: cn(
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        'shadow-button hover:shadow-md'
      ),
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={(el) => {
          // Handle both refs
          if (typeof ref === 'function') ref(el);
          else if (ref && 'current' in ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          if (el) (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        className={cn(
          // Base styles
          'relative overflow-hidden font-medium rounded-lg',
          'transition-all duration-300 ease-out',
          'transform-gpu hover:scale-[1.02] active:scale-[0.98]',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'select-none touch-manipulation',
          
          // Variants
          variants[variant],
          
          // Sizes
          sizes[size],
          
          // States
          isDisabled && 'opacity-50 cursor-not-allowed hover:scale-100',
          fullWidth && 'w-full',
          
          // Loading state
          loading && 'cursor-wait',
          
          // Custom className
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple, index) => (
          <span
            key={index}
            className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        {/* Content */}
        <span className={cn(
          'relative z-10 flex items-center justify-center gap-2',
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>

        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5"
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
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;