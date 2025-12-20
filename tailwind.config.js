/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        indigo: {
          900: '#1a1f3d',
          800: '#2d3561',
          600: '#4f46e5', // Primary Brand Color
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
      }
    }
  },
  plugins: [],
}

