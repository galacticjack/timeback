/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tb-dark': '#ffffff',
        'tb-darker': '#f9fafb',
        'tb-accent': '#6366f1',
        'tb-accent-light': '#818cf8',
        'tb-text': '#111827',
        'tb-text-secondary': '#6b7280',
        'tb-card': '#ffffff',
        'tb-border': '#e5e7eb',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
