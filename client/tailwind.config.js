/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CineVerse brand palette
        brand: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f3d0fe",
          300: "#e9a8fd",
          400: "#d971f8",
          500: "#c044ef",
          600: "#a21bcb",
          700: "#8618a6",
          800: "#701887",
          900: "#5c186f",
        },
        dark: {
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a26",
          600: "#22222f",
          500: "#2d2d3f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #c044ef 0%, #7c3aed 100%)",
        "gradient-card": "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.95) 100%)",
      },
    },
  },
  plugins: [],
};
