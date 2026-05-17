/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#004ac6",
        "on-surface": "#131b2e",
        "on-surface-variant": "#434655",
        "background": "#faf8ff",
        "surface": "#ffffff",
        "surface-container": "#eaedff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f9ff",
        "surface-container-high": "#e1e4f5",
        "outline-variant": "#c3c6d7",
        "secondary": "#434655",
        "error": "#b3261e",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "sans": ["Manrope", "sans-serif"],
      },
      spacing: {
        "margin-mobile": "1rem",
        "margin-desktop": "2.5rem",
        "container-max": "1280px",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
