/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        soma: {
          'bg-base': 'var(--soma-bg-base)',
          'bg-surface': 'var(--soma-bg-surface)',
          'bg-elevated': 'var(--soma-bg-elevated)',
          'fg-primary': 'var(--soma-fg-primary)',
          'fg-secondary': 'var(--soma-fg-secondary)',
          'fg-muted': 'var(--soma-fg-muted)',
          'border-subtle': 'var(--soma-border-subtle)',
          'border-default': 'var(--soma-border-default)',
          'organ-damaged': 'var(--soma-organ-damaged)',
          'organ-mid': 'var(--soma-organ-mid)',
          'organ-healthy': 'var(--soma-organ-healthy)',
          'accent': 'var(--soma-accent-default)',
          'accent-hover': 'var(--soma-accent-hover)',
          'accent-focus': 'var(--soma-accent-focus)',
          'confidence-high': 'var(--soma-confidence-high)',
          'confidence-medium': 'var(--soma-confidence-medium)',
          'confidence-low': 'var(--soma-confidence-low)',
        },
      },
    },
  },
  plugins: [],
};