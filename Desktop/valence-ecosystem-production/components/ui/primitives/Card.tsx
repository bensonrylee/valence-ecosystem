import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      rounded = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white shadow-sm',
      bordered: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const radiuses = {
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden',
          'transition-all duration-300 ease-out',
          
          // Variants
          variants[variant],
          
          // Padding
          paddings[padding],
          
          // Border radius
          radiuses[rounded],
          
          // Interactive states
          interactive && [
            'cursor-pointer',
            'hover:shadow-lg hover:-translate-y-0.5',
            'active:scale-[0.99]',
            'transform-gpu',
          ],
          
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          bordered && 'border-b border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body Component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          !noPadding && 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          bordered && 'border-t border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;