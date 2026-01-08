import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          neon: "#08f7fe",
          focus: "#00eaff",
        },
        midnight: "#000000",
        ink: "#0b0f14",
        glass: "rgba(255, 255, 255, 0.04)",
      },
      boxShadow: {
        neon: "0 0 24px rgba(8, 247, 254, 0.4)",
        glow: "0 10px 40px rgba(0, 234, 255, 0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        display: ["var(--font-space)"],
        body: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};

export default config;















