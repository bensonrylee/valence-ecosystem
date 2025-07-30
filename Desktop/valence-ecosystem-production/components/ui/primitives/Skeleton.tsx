import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
  lineHeight?: string | number;
  lastLineWidth?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      lines = 1,
      lineHeight = '1rem',
      lastLineWidth = '80%',
      style,
      ...props
    },
    ref
  ) => {
    const variants = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    const baseStyles = cn(
      'bg-gray-200',
      variants[variant],
      animations[animation],
      className
    );

    // Single skeleton
    if (lines === 1) {
      return (
        <div
          ref={ref}
          className={baseStyles}
          style={{
            width: width || (variant === 'text' ? '100%' : undefined),
            height: height || (variant === 'text' ? lineHeight : undefined),
            ...style,
          }}
          aria-hidden="true"
          {...props}
        />
      );
    }

    // Multiple lines for text variant
    return (
      <div ref={ref} className="space-y-2" aria-hidden="true" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseStyles}
            style={{
              width: index === lines - 1 ? lastLineWidth : '100%',
              height: lineHeight,
              ...style,
            }}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Container Component
export interface SkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const SkeletonContainer = forwardRef<HTMLDivElement, SkeletonContainerProps>(
  ({ loading = true, children, className, ...props }, ref) => {
    if (!loading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={className} aria-busy="true" {...props}>
        {children}
      </div>
    );
  }
);

SkeletonContainer.displayName = 'SkeletonContainer';

// Common Skeleton Patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <Skeleton 
    variant="text" 
    lines={lines} 
    className={className}
  />
);

export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({ 
  size = '40px', 
  className 
}) => (
  <Skeleton 
    variant="circular" 
    width={size} 
    height={size} 
    className={className}
  />
);

export const SkeletonButton: React.FC<{ width?: string; className?: string }> = ({ 
  width = '120px', 
  className 
}) => (
  <Skeleton 
    variant="rounded" 
    width={width} 
    height="40px" 
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <Skeleton variant="rounded" height="200px" />
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" lines={2} />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="100px" />
      <SkeletonButton width="80px" />
    </div>
  </div>
);

export const SkeletonListItem: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-4', className)}>
    <SkeletonAvatar />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="70%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="flex space-x-4 pb-2 border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={`header-${i}`} 
          variant="text" 
          width={i === 0 ? '150px' : '100px'} 
          className="h-4"
        />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            variant="text" 
            width={colIndex === 0 ? '150px' : '100px'}
            className="h-4"
          />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;