/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // darkMode: 'class', // Removed for production build
  theme: {
    extend: {
      colors: {
        // Dark theme primary colors
        'dark': '#0D0D0D',
        'dark-lighter': '#1A1A1A',
        'dark-card': '#141414',
        'dark-border': 'rgba(255, 255, 255, 0.1)',
        
        // Accent colors
        'accent': {
          DEFAULT: '#00FFAD',
          50: '#B3FFE6',
          100: '#99FFDE',
          200: '#66FFCE',
          300: '#33FFBD',
          400: '#00FFAD',
          500: '#00CC8A',
          600: '#009968',
          700: '#006645',
          800: '#003322',
          900: '#001A11',
        },
        
        // Glass effect colors
        'glass': {
          'white': 'rgba(255, 255, 255, 0.05)',
          'light': 'rgba(255, 255, 255, 0.1)',
          'medium': 'rgba(255, 255, 255, 0.15)',
          'dark': 'rgba(0, 0, 0, 0.5)',
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 255, 173, 0.1)',
        'glass-sm': '0 4px 16px 0 rgba(0, 255, 173, 0.08)',
        'glow': '0 0 20px rgba(0, 255, 173, 0.3)',
        'button': '0 4px 15px 0 rgba(0, 0, 0, 0.3)',
      },
      
      animation: {
        'ripple': 'ripple 600ms linear',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
      },
      
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          '@apply backdrop-blur-md bg-glass-white border border-dark-border': {},
        },
        '.glass-card': {
          '@apply glass rounded-2xl shadow-glass': {},
        },
        '.glass-button': {
          '@apply backdrop-blur-md bg-glass-light border border-dark-border hover:bg-glass-medium transition-all duration-300': {},
        },
        '.text-gradient': {
          '@apply bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent': {},
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}