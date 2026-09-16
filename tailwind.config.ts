import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0A0B0F",
          card: "#12141C",
          hover: "#1A1D28",
        },
        border: {
          DEFAULT: "#1F2230",
          hover: "#2D3142",
        },
        profit: "#10B981",
        loss: "#EF4444",
        neutral: "#F59E0B",
        primary: "#3B82F6",
        text: {
          primary: "#F5F7FA",
          muted: "#8B92A8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
