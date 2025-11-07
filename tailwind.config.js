/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-main": "#FFFFFF",
        "text-main": "#1F2937",
        "text-secondary": "#6B8E23",
        "accent-primary": "#6B8E23",
        "accent-secondary": "#F0EAD6",
        "hover-highlight": "#5a7a1e",
        "divider": "#F0EAD6",
      },
    },
  },
  plugins: [],
}