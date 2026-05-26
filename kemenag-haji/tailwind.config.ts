import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f1",
          100: "#dcf0de",
          500: "#1f8a3a",
          600: "#177030",
          700: "#125827",
          800: "#0e441f",
          900: "#0a3318",
        },
        gold: {
          400: "#d4af37",
          500: "#b8941f",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
