/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./index.html",
    "./public/pages/*.html",
    "./public/style/input.css",
    "./src/*.ts",
  ],
  theme: {
    extend: {
      fontFamily: {
        arcade: ['"Press Start 2P"', "cursive"],
        pixelify: ["'Pixelify Sans'", "sans-serif"],
      },
      colors: {
        neon: "#39ff14",
        crtBlue: "#00ffff",
        crtPurple: "#c000ff",
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 1px, transparent 1px, transparent 2px)",
      },
      animation: {
        flicker: "flicker 2s infinite",
        "spin-slow": "spin 6s linear infinite",
        "spin-reverse-slower": "spin-reverse 10s linear infinite",
        "spin-slowest": "spin 15s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
};
