const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  variants: {
    extend: {
      height: ["checked"],
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      colors: {
        warmGray: colors.warmGray,
      },
      cursor: {
        "col-resize": "col-resize",
      },
      minWidth: {
        4: "1rem",
        80: "20rem",
      },
      padding: {
        "9/16": "56.25%",
      },
    },
  },
  plugins: [],
};
