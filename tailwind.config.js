/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // Amazon-inspired color palette
        amazon: {
          navy: "#131921",
          navyLight: "#232F3E",
          orange: "#FF9900",
          yellow: "#F7CA00",
          yellowDark: "#E7A800",
          background: "#EAEDED",
          border: "#DEBD5F",
        },
      },
      boxShadow: {
        amazon: "0 2px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
