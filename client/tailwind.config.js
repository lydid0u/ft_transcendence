/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.{html,js,ts}",
    "./src/**/*.{js,ts}",
    "./ts/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'purple-light': '#e8e0ff',
        'purple-medium': '#d4c5ff',
        'purple-dark': '#9b6dff',
        'pink-light': '#ffb3d9',
        'pink-medium': '#ff69b4',
        'pink-dark': '#ff1493'
      },
      fontFamily: {
        sans: ['Oswald', 'sans-serif'], 
      },
      boxShadow: {
        'browser': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'gradient-text': 'linear-gradient(to right, var(--tw-gradient-stops))'
      }
    }
  },
  plugins: []
}
