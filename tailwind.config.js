/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        presence: {
          dark: "#0b0f1a",
          mid: "#141a27",
          light: "#e5e7eb",
          accent: "#b91c1c",
          accent2: "#7f1d1d",
          red: "#ef4444",
          green: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
