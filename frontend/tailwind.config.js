/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#80a3ff',
          500: '#4d7cff',
          600: '#2651f2',
          700: '#1a3dd9',
          800: '#1732b3',
          900: '#192f8c',
          950: '#101c54',
        },
      },
    },
  },
  plugins: [],
}
