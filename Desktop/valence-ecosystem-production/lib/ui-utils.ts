import { formatDistanceToNow, isToday, isYesterday, format, differenceInMinutes, differenceInHours } from 'date-fns';

/**
 * Generate a consistent gradient background from a string (e.g., username)
 * This ensures the same name always produces the same gradient
 */
export function generateGradient(name: string): string {
  // Create a hash from the string
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate two hue values for the gradient
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 30) % 360;
  
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 50%))`;
}

/**
 * Generate a single color from a string (for solid backgrounds)
 */
export function generateColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

/**
 * Format timestamp in a human-friendly way
 * Just now, 5m ago, 2h ago, Yesterday, Oct 15
 */
export function formatSmartTime(date: Date | { toDate: () => Date }): string {
  // Handle Firestore timestamps
  const actualDate = typeof date === 'object' && 'toDate' in date ? date.toDate() : date;
  
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, actualDate);
  const diffHours = differenceInHours(now, actualDate);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (isYesterday(actualDate)) return 'Yesterday';
  if (diffHours < 168) return format(actualDate, 'EEEE'); // Day name if within a week
  
  return format(actualDate, 'MMM d');
}

/**
 * Format time for chat messages
 */
export function formatChatTime(date: Date | { toDate: () => Date }): string {
  const actualDate = typeof date === 'object' && 'toDate' in date ? date.toDate() : date;
  
  if (isToday(actualDate)) {
    return format(actualDate, 'h:mm a');
  } else if (isYesterday(actualDate)) {
    return 'Yesterday';
  } else {
    return format(actualDate, 'MMM d');
  }
}

/**
 * Truncate text with fade effect support
 */
export function truncateWithFade(text: string, maxLength: number): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false };
  }
  
  // Find last complete word within limit
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return {
    text: lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated,
    truncated: true
  };
}

/**
 * Generate ripple effect coordinates from click/touch event
 */
export function getRippleCoords(event: React.MouseEvent | React.TouchEvent, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  let x, y;
  
  if ('touches' in event) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }
  
  return { x, y };
}

/**
 * Haptic feedback wrapper (safe for non-supporting devices)
 */
export function triggerHaptic(duration: number = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

/**
 * Format currency with proper decimal handling
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Get initials from name (max 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}