export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cboi-blue': '#0b3b60',
        'cboi-blue-light': '#0d4a7a',
        'cboi-blue-dark': '#082e4d',
        'cboi-orange': '#f08c00',
        'cboi-orange-hover': '#e07a00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
