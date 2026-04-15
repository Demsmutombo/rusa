/** @type {import('tailwindcss').Config} */
/*
 * Rusa Travel — color reference for IDEs and tooling.
 * Tailwind v4 theme tokens live in src/assets/main.css (@theme) + src/assets/styles/theme.css (:root).
 * Do not add @config to main.css: it would replace the default theme preset.
 */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-50)',
          100: 'var(--color-100)',
          200: 'var(--color-200)',
          300: 'var(--color-300)',
          400: 'var(--color-400)',
          500: 'var(--color-500)',
          600: 'var(--color-600)',
          700: 'var(--color-700)',
          800: 'var(--color-800)',
          900: 'var(--color-900)',
          950: 'var(--color-950)',
        },
        accent: 'var(--accent)',
        success: 'var(--success)',
        error: 'var(--error)',
      },
    },
  },
}
