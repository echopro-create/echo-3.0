import fs from "node:fs";
const tokens = JSON.parse(fs.readFileSync("./tokens.json","utf-8"));
const lines = [":root {"];
for (const [group, map] of Object.entries(tokens)) {
  for (const [k,v] of Object.entries(map)) {
    lines.push(`  --${group}-${k}: ${v};`);
  }
}
lines.push("}");
const out = `/* Auto-generated from tokens.json */\n${lines.join("\n")}\n`;
fs.mkdirSync("./styles", {recursive:true});
fs.writeFileSync("./styles/styles.css", out, "utf-8");
console.log("Generated styles/styles.css");
