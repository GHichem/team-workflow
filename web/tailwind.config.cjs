/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          pink: '#F075AE',
          sand: '#F7DB91',
          cream: '#FFFDCE',
          green: '#9BC264',
        },
        site: {
          bg: '#0b0b0f',
          card: '#0f0f15',
          text: '#f5f5f7',
          muted: 'rgba(245, 245, 247, 0.7)',
          border: 'rgba(245, 245, 247, 0.08)'
        }
      }
    },
  },
  plugins: [],
};
