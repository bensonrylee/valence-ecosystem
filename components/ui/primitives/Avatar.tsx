import React from 'react'
import { cn } from '@/lib/utils'
import { generateGradient, getInitials } from '@/lib/ui-utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: React.ReactNode
}

export function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className,
  fallback 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-xl'
  }

  const [imageError, setImageError] = React.useState(false)
  const shouldShowFallback = !src || imageError

  const handleImageError = () => {
    setImageError(true)
  }

  const renderFallback = () => {
    if (fallback) return fallback
    
    if (name) {
      const initials = getInitials(name)
      const gradient = generateGradient(name)
      
      return (
        <div 
          className={cn(
            'flex items-center justify-center font-semibold text-white',
            `bg-gradient-to-br ${gradient}`
          )}
        >
          {initials}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center text-gray-400">
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative inline-block rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {!shouldShowFallback ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        renderFallback()
      )}
    </div>
  )
}

// Avatar group component
interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    alt?: string
    name?: string
  }>
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AvatarGroup({ 
  avatars, 
  max = 4, 
  size = 'md', 
  className 
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          className="ring-2 ring-gray-800"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-700 text-white font-medium ring-2 ring-gray-800',
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-12 w-12 text-sm',
            size === 'lg' && 'h-16 w-16 text-lg',
            size === 'xl' && 'h-24 w-24 text-xl'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
} 