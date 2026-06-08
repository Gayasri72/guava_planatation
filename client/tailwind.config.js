/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        guava: {
          50: '#f3faf3',
          100: '#e3f4e4',
          500: '#3fa64a',
          600: '#338a3d',
          700: '#266b2f',
        },
      },
    },
  },
  plugins: [],
};
