/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  // @ts-ignore
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary: "#151312",
        light: {
          100: "#D6C6FF",
          200: "#AB8BFF",
          300: "#7A4DFF",
        },
        dark: {
          100: "#221f3d",
          200: "#0f0d23",
          300: "#0A090A",
        },
        accent: "#AB8BFF",
      },
    },
  },
  plugins: [],
};
