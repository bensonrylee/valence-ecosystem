import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { generateGradient, getInitials } from '@/lib/ui-utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  bordered?: boolean;
  borderColor?: string;
  fallbackIcon?: React.ReactNode;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      statusPosition = 'bottom-right',
      bordered = false,
      borderColor = 'border-white',
      fallbackIcon,
      style,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-24 h-24 text-2xl',
    };

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5',
    };

    const statusPositions = {
      'top-right': 'top-0 right-0',
      'bottom-right': 'bottom-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-left': 'bottom-0 left-0',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    const shouldShowImage = src && !imageError;
    const shouldShowInitials = !shouldShowImage && name;
    const shouldShowFallback = !shouldShowImage && !name;

    const initials = name ? getInitials(name) : '';
    const gradient = name ? generateGradient(name) : 'linear-gradient(135deg, #667eea, #764ba2)';

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'flex-shrink-0 select-none',
          sizes[size],
          shapes[shape],
          bordered && `ring-2 ${borderColor}`,
          className
        )}
        {...props}
      >
        {/* Image */}
        {shouldShowImage && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover',
              shapes[shape]
            )}
          />
        )}

        {/* Initials */}
        {shouldShowInitials && (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center',
              'font-medium text-white',
              shapes[shape]
            )}
            style={{
              ...style,
              background: gradient,
            }}
          >
            {initials}
          </div>
        )}

        {/* Fallback Icon */}
        {shouldShowFallback && (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center',
              'bg-gray-200 text-gray-500',
              shapes[shape]
            )}
            style={style}
          >
            {fallbackIcon || (
              <svg
                className="w-1/2 h-1/2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}

        {/* Status Indicator */}
        {status && (
          <span
            className={cn(
              'absolute block rounded-full',
              'ring-2 ring-white',
              statusSizes[size],
              statusColors[status],
              statusPositions[statusPosition]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = 'md', spacing = 'normal', children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const remainingCount = max && childrenArray.length > max ? childrenArray.length - max : 0;

    const spacings = {
      tight: '-space-x-2',
      normal: '-space-x-3',
      loose: '-space-x-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacings[spacing],
          className
        )}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="relative"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {React.isValidElement(child) && React.cloneElement(child as React.ReactElement<AvatarProps>, {
              size,
              bordered: true,
            })}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className="relative"
            style={{ zIndex: 0 }}
          >
            <Avatar
              size={size}
              name={`+${remainingCount}`}
              bordered
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;