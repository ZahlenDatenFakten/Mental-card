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
        'floating': '0 12px 36px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out forwards',
        'scale-in': 'scaleIn 150ms ease-out forwards',
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
