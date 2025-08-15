/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 700: 'var(--brand-700)', 600: 'var(--brand-600)', 500: 'var(--brand-500)' },
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        divider: 'var(--divider)',
        text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)', ondark: 'var(--text-on-dark)' },
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      boxShadow: { soft: 'var(--shadow-soft)' },
      borderRadius: { lg: 'var(--radius-lg)' },
      spacing: { section: 'var(--section-y)' },
      fontSize: {
        display: ['var(--h1)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['var(--h1-md)', { lineHeight: '1.1' }],
        'display-sm': ['var(--h1-sm)', { lineHeight: '1.15' }],
        base: ['var(--body)', { lineHeight: '1.6' }],
        lg: ['var(--body-lg)', { lineHeight: '1.75' }],
      },
      maxWidth: { container: '72rem' },
    },
  },
  plugins: [],
};
