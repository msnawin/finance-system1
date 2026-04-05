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
        background: 'var(--background)',
        card: 'var(--card)',
        cardContent: 'var(--card-content)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        textMain: 'var(--text-main)',
        textMuted: 'var(--text-muted)',
      }
    },
  },
  plugins: [],
}
