import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080808",
        obsidian: {
          950: "#050505",
          900: "#080808",
          850: "#0c0c0e",
          800: "#111114",
          700: "#17171c",
          600: "#22222a",
        },
        surface: {
          50: "#202026",
          100: "#16161a",
          200: "#0f0f13",
          300: "#09090c",
        },
        lime: {
          accent: "#c6f135",
          bright: "#d4ff33",
          glow: "#a3e635",
          dark: "#4d7c0f",
        },
        violet: {
          glow: "#a855f7",
          deep: "#4c1d95",
          dark: "#2e1065",
        },
        brand: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          accent: "#c6f135",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ripple": "ripple 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(198, 241, 53, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(198, 241, 53, 0.6), 0 0 50px rgba(139, 92, 246, 0.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      }
    },
  },
  plugins: [],
};
export default config;
