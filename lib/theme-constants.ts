// Theme constants for consistent styling across the application
export const theme = {
  // Layout
  maxWidth: {
    container: '1280px',
    content: '1024px',
    narrow: '768px',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Component-specific styles
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 12px',
        md: '0 16px',
        lg: '0 24px',
      },
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
    },
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px',
      },
    },
  },
  
  // Glass panel styles (for dark theme)
  glass: {
    panel: 'bg-white/5 backdrop-blur-lg border border-white/10',
    input: 'bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
    button: 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20',
  },
  
  // Animation presets
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    base: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
    colors: 'transition-colors duration-300 ease-out',
    transform: 'transition-transform duration-300 ease-out',
    opacity: 'transition-opacity duration-300 ease-out',
  },
} as const;

// Utility functions
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900';

export const glassPanelClasses = 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg';
export const glassInputClasses = 'bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-lg px-4 py-2';