/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        orange: colors.orange, // ✅ keep Tailwind’s full orange palette
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
}
