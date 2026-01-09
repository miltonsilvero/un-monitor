/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'un-blue': '#009edb',
        'un-dark': '#1e3a8a',
      },
    },
  },
  plugins: [],
}
