/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c', // Deep macOS dark background
        apple: {
          blue: '#0A84FF',
          purple: '#BF5AF2',
          indigo: '#5E5CE6',
          teal: '#64D2FF',
          green: '#30D158',
          yellow: '#FFD60A',
          orange: '#FF9F0A',
          red: '#FF453A',
          pink: '#FF375F',
          gray1: '#8E8E93',
          gray2: '#636366',
          gray3: '#48484A',
          gray4: '#3A3A3C',
          gray5: '#2C2C2E',
          gray6: '#1C1C1E',
          surface: '#161618',
          card: '#1c1c1e',
        },
        surface: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
        },
        brand: {
          DEFAULT: '#0A84FF', // Apple system blue primary
          emerald: '#30D158',
          glow: 'rgba(10, 132, 255, 0.25)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          'Inter',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"SFMono-Regular"',
          'ui-monospace',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'apple-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'apple-active': '0 0 0 2px #0A84FF, 0 12px 36px -4px rgba(10, 132, 255, 0.35)',
        'apple-hud': '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'apple-modal': '0 32px 64px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'apple-btn': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'apple-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'apple-spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'apple-fade-in': 'fadeIn 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'apple-scale-in': 'scaleIn 200ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
