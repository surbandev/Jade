/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resume: {
          navy: '#1e2442',
          'navy-light': '#2d3561',
          accent: '#667eea',
          purple: '#764ba2',
        },
        angel: {
          bg: '#f8fafc',
          accent: '#0d9488',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
