/** @type {import('tailwindcss').Config} */
// All colors route through CSS variables (see src/index.css), which flip between
// light and dark per the spec token set. This keeps Tailwind utilities theme-aware.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        'text-4': 'var(--text-4)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-soft': 'var(--accent-soft)',
        amber: 'var(--amber)',
        'amber-soft': 'var(--amber-soft)',
        'amber-text': 'var(--amber-text)',
        emerald: 'var(--emerald)',
        'emerald-soft': 'var(--emerald-soft)',
        'emerald-text': 'var(--emerald-text)',
        purple: 'var(--purple)',
        'purple-soft': 'var(--purple-soft)',
        'purple-text': 'var(--purple-text)',
        red: 'var(--red)',
        'red-soft': 'var(--red-soft)',
        'red-text': 'var(--red-text)',
        pink: 'var(--pink)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['SF Mono', 'JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
