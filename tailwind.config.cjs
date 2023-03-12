/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        up: "0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);",
      },
      borderWidth: {
        3: "3px",
      },
      colors: {
        //         primary: {
        //             100: "#d5e5f6",
        //             200: "#abcbed",
        //             300: "#81b1e4",
        //             400: "#5797db",
        //             500: "#2d7dd2",
        //             600: "#2464a8",
        //             700: "#1b4b7e",
        //             800: "#123254",
        //             900: "#09192a",
        //         },
        //         secondary: {
        //             100: "#fffad9",
        //             200: "#fff4b3",
        //             300: "#feef8c",
        //             400: "#fee966",
        //             500: "#fee440",
        //             600: "#cbb633",
        //             700: "#988926",
        //             800: "#665b1a",
        //             900: "#332e0d",
        //         },
        //         tertiary: {
        //             100: "#f5f8fa",
        //             200: "#ecf2f5",
        //             300: "#e2ebf1",
        //             400: "#d9e5ec",
        //             500: "#cfdee7",
        //             600: "#a6b2b9",
        //             700: "#7c858b",
        //             800: "#53595c",
        //             900: "#292c2e",
        //         },
        //         accent: {
        //             100: "#ccd1d7",
        //             200: "#99a3af",
        //             300: "#677586",
        //             400: "#34475e",
        //             500: "#011936",
        //             600: "#01142b",
        //             700: "#010f20",
        //             800: "#000a16",
        //             900: "#00050b",
        //         },
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
