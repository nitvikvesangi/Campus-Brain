/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        panel: '#12121a',
        panel2: '#1a1a24',
        border: '#2a2a38',
        accent: '#7c5cff',
        accent2: '#22d3ee',
        muted: '#8a8aa0',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
