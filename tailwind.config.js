/** @type {import('tailwindcss').Config} */
// Tokens sourced from the TMA brand system (Design_Principles_rehab_crm):
// warm gold accent, warm "noir" darks, soft ivory lights, muted semantic colors.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf6e8',
          100: '#f4e6c2',
          200: '#ecd29a',
          300: '#dfba6e',
          400: '#cfa657',
          500: '#c5a253',
          600: '#a98641',
          700: '#876830',
          800: '#604a22',
          900: '#3a2c14',
          soft: '#f2e0b6',
        },
        noir: {
          700: '#2b2b2b',
          800: '#242424',
          900: '#1f1f1f',
        },
        ivory: {
          50: '#fbf9f4',
          100: '#fbf6e8',
          200: '#f4e6c2',
        },
        // Muted semantic states.
        success: '#5b8a5a',
        warning: '#c08a3e',
        danger: '#a3463c',
        info: '#4a6c7a',
        // Theme-aware surface tokens (driven by CSS variables in index.css).
        surface: 'var(--bg-surface)',
        canvas: 'var(--bg-canvas)',
        'fg-1': 'var(--fg-1)',
        'fg-2': 'var(--fg-2)',
        'fg-3': 'var(--fg-3)',
        'border-soft': 'var(--border-soft)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'display-he': ['"Frank Ruhl Libre"', '"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'Heebo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
      },
      boxShadow: {
        3: '0 12px 40px rgba(31,31,31,0.12)',
      },
    },
  },
  plugins: [],
};
