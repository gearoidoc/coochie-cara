/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        coral: '#FF6B6B',
        coralDark: '#E85A5A',
        sage: '#A8C5A0',
        butter: '#F4D35E',
        ink: '#2D2A32',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}