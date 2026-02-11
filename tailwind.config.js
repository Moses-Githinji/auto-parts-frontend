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
        // Dark mode palette
        dark: {
          primary: "#1a3d6b", // Darker shade of #2b579a
          bg: "#0f1419",
          bgLight: "#1a1f2e",
          border: "#2d3748",
          text: "#e2e8f0",
          textMuted: "#a0aec0",
        },
      },
      boxShadow: {
        amazon: "0 2px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
