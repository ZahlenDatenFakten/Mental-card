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
        background: '#09090b',
        // Exact Apple System Dark Mode Palette (HIG)
        apple: {
          blue: '#0A84FF',
          green: '#30D158',
          indigo: '#5E5CE6',
          orange: '#FF9F0A',
          pink: '#FF375F',
          purple: '#BF5AF2',
          red: '#FF453A',
          teal: '#64D2FF',
          yellow: '#FFD60A',
          // Neutral Grays (Apple HIG Dark)
          gray1: '#8E8E93',
          gray2: '#636366',
          gray3: '#48484A',
          gray4: '#3A3A3C',
          gray5: '#2C2C2E',
          gray6: '#1C1C1E',
          bg: '#000000',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          'system-ui',
          'Inter',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"SFMono-Regular"',
          'ui-monospace',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 0 0 0.5px rgba(255, 255, 255, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'apple-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)',
        'apple-focus': '0 0 0 3.5px rgba(10, 132, 255, 0.45), 0 0 0 1px #0A84FF, 0 8px 24px rgba(10, 132, 255, 0.3)',
        'apple-drag': '0 24px 50px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px #0A84FF, inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
        'apple-hud': '0 20px 48px rgba(0, 0, 0, 0.65), 0 0 0 0.5px rgba(255, 255, 255, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'apple-sheet': '0 30px 70px -10px rgba(0, 0, 0, 0.85), 0 0 0 0.5px rgba(255, 255, 255, 0.16), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)',
        'apple-segmented': '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'apple-ease': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'apple-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      animation: {
        'apple-fade-in': 'fadeIn 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'apple-spring-in': 'springIn 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        springIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
