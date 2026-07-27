/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bcd1ff',
          300: '#8db1ff',
          400: '#5b88ff',
          500: '#3a63f5',
          600: '#2645d9',
          700: '#2035ae',
          800: '#1f2f8a',
          900: '#1e2a6e',
        },
      },
    },
  },
  plugins: [],
};
