/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — Colombia Theme
        brand: {
          yellow: '#FCD116',
          blue: '#003893',
          red: '#CE1126',
        },
        dark: {
          950: '#050505',
          900: '#0A0A0A',
          800: '#111111',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2A2A2A',
          400: '#333333',
          300: '#444444',
        },
        neutral: {
          50:  '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1' }],
      },
      borderRadius: {
        sm:   '6px',
        DEFAULT: '10px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
        '3xl':'32px',
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(245,197,24,0.25)',
        'glow-yellow-lg': '0 0 40px rgba(245,197,24,0.35)',
        'card': '0 2px 8px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.7)',
        'modal': '0 24px 64px rgba(0,0,0,0.8)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-expo': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-up': 'slideUp 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-down': 'slideDown 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'stagger-1': 'slideUp 300ms 0ms cubic-bezier(0.23, 1, 0.32, 1) both',
        'stagger-2': 'slideUp 300ms 50ms cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulseGlow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,197,24,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(245,197,24,0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
