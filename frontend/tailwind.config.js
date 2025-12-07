/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F1A3B", // Infosys Dark Blue
          accent: "#00A9E0", // Infosys Cyan
          secondary: "#005691", // Medium Blue
          bg: "#F9F9FB", // Light Grey Background
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
