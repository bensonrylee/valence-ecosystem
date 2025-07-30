import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  dot?: boolean;
  dotColor?: string;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = 'full',
      icon,
      iconPosition = 'left',
      dot = false,
      dotColor,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-gray-100 text-gray-700 border-gray-200',
      primary: 'bg-blue-100 text-blue-700 border-blue-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      danger: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    const radiuses = {
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    const dotColors = {
      default: 'bg-gray-500',
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-indigo-500',
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium border',
          'transition-all duration-200',
          
          // Variants
          variants[variant],
          
          // Sizes
          sizes[size],
          
          // Border radius
          radiuses[rounded],
          
          // Custom className
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className={cn(
              'flex-shrink-0 rounded-full',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-2.5',
              dotColor || dotColors[variant]
            )}
          />
        )}

        {/* Icon left */}
        {icon && iconPosition === 'left' && !dot && (
          <span className={cn(
            'flex-shrink-0',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5'
          )}>
            {icon}
          </span>
        )}

        {/* Content */}
        <span>{children}</span>

        {/* Icon right */}
        {icon && iconPosition === 'right' && !dot && (
          <span className={cn(
            'flex-shrink-0',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5'
          )}>
            {icon}
          </span>
        )}

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              'flex-shrink-0 ml-1 -mr-0.5',
              'rounded-full hover:bg-black/10 active:bg-black/20',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              variant === 'default' && 'focus:ring-gray-500',
              variant === 'primary' && 'focus:ring-blue-500',
              variant === 'success' && 'focus:ring-green-500',
              variant === 'warning' && 'focus:ring-yellow-500',
              variant === 'danger' && 'focus:ring-red-500',
              variant === 'info' && 'focus:ring-indigo-500'
            )}
            aria-label="Remove badge"
          >
            <svg
              className={cn(
                size === 'sm' && 'w-3 h-3',
                size === 'md' && 'w-3.5 h-3.5',
                size === 'lg' && 'w-4 h-4'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Badge Group Component
export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, gap = 'md', wrap = true, children, ...props }, ref) => {
    const gaps = {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          gaps[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';

export default Badge;