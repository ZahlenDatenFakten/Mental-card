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
        background: '#09090b', // zinc-950
        surface: {
          50: '#18181b', // zinc-900
          100: '#27272a', // zinc-800
          200: '#3f3f46', // zinc-700
          300: '#52525b', // zinc-600
        },
        brand: {
          DEFAULT: '#10b981', // emerald-500 for crisp focused state
          subtle: '#064e3b',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        'node': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'node-active': '0 0 0 2px #10b981, 0 8px 30px -4px rgba(16, 185, 129, 0.3)',
        'floating': '0 16px 40px -4px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.09)',
      },
      transitionTimingFunction: {
        'apple-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'apple-spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 160ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scaleIn 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
