/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#dae3f3',
          200: '#bcc9e7',
          300: '#95a6d7',
          400: '#7483c9',
          500: '#5e67b9',
          600: '#4e509a',
          700: '#3e4079',
          800: '#302f58',
          900: '#24233a',
          950: '#17172b',
        },
      },
    },
  },
  plugins: [],
}
