import { generateId } from './utils'

export function generateGradient(name: string): string {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-green-600',
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-600'
  ]
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatSmartTime(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function triggerHaptic(duration: number = 50): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

export function generateAvatarUrl(name: string, size = 200): string {
  const initials = getInitials(name)
  const gradient = generateGradient(name)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&size=${size}&bold=true`
}

export function calculateRating(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const decimal = rating - full
  const half = decimal >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  
  return { full, half, empty }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateUniqueId(): string {
  return `${Date.now()}-${generateId()}`
} 