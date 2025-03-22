/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfdf9',
          100: '#f6f6ec', // Main background
          200: '#efefe0',
          300: '#e8e8d4',
          400: '#e1e1c8',
          500: '#dadabc',
          600: '#d3d3b0',
          700: '#cccc94',
          800: '#c5c588',
          900: '#bebe7c',
          DEFAULT: '#f6f6ec'
        },
        green: {
          50: '#e6f4eb',
          100: '#cce9d7',
          200: '#99d3af',  // Light accent
          300: '#66bd87',  // Secondary
          400: '#339d5f',  // Primary
          500: '#0e813e',  // Main brand color
          600: '#0b6731',
          700: '#084d24',
          800: '#063417',
          900: '#031a0b',
          DEFAULT: '#0e813e'
        },
        earth: {
          100: '#e6dfd3', // Light earth tone
          200: '#d1c3ae', // Medium earth tone
          300: '#b8a086', // Dark earth tone
          DEFAULT: '#d1c3ae'
        }
      },
    },
  },
  plugins: [],
} 