import fs from "node:fs";
const tokens = {
  color: { bg: "#ffffff", text: "#0a0a0a", primary: "#000000", muted: "#666666" },
  radius: { md: "12px", lg: "16px" }
};
const out = `:root{--bg:${tokens.color.bg};--text:${tokens.color.text};--primary:${tokens.color.primary};--muted:${tokens.color.muted}}`;
fs.mkdirSync("styles", { recursive: true });
fs.writeFileSync("styles/tokens.css", out);
console.log("css tokens generated");
