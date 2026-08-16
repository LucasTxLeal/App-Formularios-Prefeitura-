import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: "#eef4ff",
            100: "#dbe7fe",
            500: "#2563eb",
            600: "#1d4ed8",
            700: "#1e40af",
            900: "#0f2557",
          },
          green: {
            500: "#16a34a",
            600: "#15803d",
          },
          slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            700: "#334155",
            900: "#0f172a",
          },
        },
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(15, 37, 87, 0.15)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
