// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/app/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // читаем переменную от next/font
        sans: ["var(--font-roboto)", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        bg: { DEFAULT: "#0b0e14", light: "#ffffff" },
        fg: { DEFAULT: "#e7eef8", light: "#0e1420" },
        accent: "#4F8BFF",
        accentWarm: "#FFC857",
        ring: "#1b2a44",
        muted: "#9FB3C8",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
