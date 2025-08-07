/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a', // Blue-900
        secondary: '#dc2626', // Red-600
        accent: '#b91c1c', // Red-700
        highlight: '#172554', // Blue-950
        background: '#ffffff', // White
        text: '#333333', // Dark gray for regular text
        footer: {
          bg: '#ffffff',
          text: '#333333', 
          hover: '#1e3a8a',
        }
      },
    },
  },
  plugins: [],
}; 