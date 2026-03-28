/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#F3EFE6',
        'gold-primary': '#C5A059',
        'gold-bright': '#D4AF37',
        'gold-dark': '#8A6B1F',
        'accent-stark': '#111111',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      lineHeight: {
        'tight-hero': '1.02',
      },
    },
  },
  plugins: [],
}
