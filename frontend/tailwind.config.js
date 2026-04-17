/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "jara-primary": {
          DEFAULT: "#192A56",
          50:  "#E8EBF4",
          500: "#3F55A3",
          800: "#192A56",
          900: "#0E1A38",
        },
        "jara-accent": {
          DEFAULT: "#0ABDE3",
          100: "#B3EEFB",
          500: "#0ABDE3",
          700: "#0792B0",
        },
        "surface": {
          light: "#F4F6FB",
          dark:  "#0D1117",
          cardDark: "#161C27",
          borderDark: "#243050",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        display: ["'Montserrat'", "sans-serif"],
      },
      boxShadow: {
        "float": "0 10px 40px -10px rgba(10, 189, 227, 0.15)",
        "float-hover": "0 20px 50px -12px rgba(10, 189, 227, 0.35)",
        "float-dark": "0 10px 40px -10px rgba(25, 42, 86, 0.5)",
      },
      transitionTimingFunction: {
        "jara-ease": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
