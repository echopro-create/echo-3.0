import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        ink: "#0a0a0a",
        mute: "#666666",
        line: "#ebebeb",
        brand: "#111111"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  darkMode: ["class"],
  corePlugins: {
    preflight: true
  },
  plugins: []
} satisfies Config;
