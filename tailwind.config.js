/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', /* slate-400/20 */
        input: 'var(--color-input)', /* slate-400/20 */
        ring: 'var(--color-ring)', /* teal-500 */
        background: 'var(--color-background)', /* white */
        foreground: 'var(--color-foreground)', /* gray-800 */
        primary: {
          DEFAULT: 'var(--color-primary)', /* teal-500 */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* teal-700 */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-500 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 */
          foreground: 'var(--color-muted-foreground)', /* slate-500 */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* amber-500 */
          foreground: 'var(--color-accent-foreground)', /* gray-800 */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white */
          foreground: 'var(--color-popover-foreground)', /* gray-800 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* slate-50 */
          foreground: 'var(--color-card-foreground)', /* gray-800 */
        },
        surface: 'var(--color-surface)', /* slate-50 */
        success: {
          DEFAULT: 'var(--color-success)', /* emerald-500 */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-500 */
          foreground: 'var(--color-warning-foreground)', /* gray-800 */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-500 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
        'text-primary': 'var(--color-text-primary)', /* gray-800 */
        'text-secondary': 'var(--color-text-secondary)', /* slate-500 */
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h5': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'warm': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'warm-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'warm-lg': '0 10px 15px rgba(0, 0, 0, 0.12)',
        'warm-xl': '0 20px 25px rgba(0, 0, 0, 0.14)',
        'warm-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.16)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'smooth': '250ms',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-right': 'slide-out-right 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fade-out 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        'sidebar': '100',
        'mobile-nav': '200',
        'dropdown': '300',
        'modal': '400',
        'toast': '500',
        'tooltip': '600',
      },
    },
  },
  plugins: [],
}