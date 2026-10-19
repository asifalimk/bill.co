/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        accent: "#e56b35",
        canvas: "#f3f5f7"
      },
      boxShadow: {
        panel: "0 8px 28px rgba(23, 33, 43, 0.07)"
      }
    }
  },
  plugins: []
};
