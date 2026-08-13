/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      colors: {
        navy: { DEFAULT: "#0A0F1D", light: "#0F172A" },
        accent: { cyan: "#00F0FF", blue: "#3B82F6" },
        emergency: { red: "#EF4444", amber: "#F59E0B", emerald: "#10B981" },
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 240, 255, 0.35)",
        "glow-red": "0 0 24px rgba(239, 68, 68, 0.45)",
        "glow-blue": "0 0 16px rgba(59, 130, 246, 0.4)",
      },
    },
  },
  plugins: [],
};
