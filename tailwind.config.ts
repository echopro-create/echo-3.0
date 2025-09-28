import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        text: "#0a0a0a",
        muted: "#666666",
        primary: "#000000"
      }
    }
  },
  plugins: []
};
export default config;
