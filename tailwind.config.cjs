/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {import('tailwindcss/defaultTheme')} */
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      width: {
        "3/10": "30%",
        "4/10": "40%",
        "6/10": "60%",
      },
      flexGrow: {
        1: 1,
        2: 2,
        3: 3,
      },
      boxShadow: {
        up: "0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);",
      },
      borderWidth: {
        1: "1px",
        3: "3px",
      },
      colors: {
        gold: {
          50: "#fffceb",
          100: "#fff7cc",
          200: "#ffef99",
          300: "#ffe766",
          400: "#ffdf33",
          500: "#ffd700",
          600: "#ccac00",
          700: "#998100",
          800: "#665600",
          900: "#332b00",
        },
      },
    },
  },
  plugins: [],
};
