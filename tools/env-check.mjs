import fs from "node:fs";
import path from "node:path";
import url from "node:url";

function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}
const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(here);

function loadEnvAt(dir) {
  const p = path.join(dir, ".env.local");
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, "utf8");
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        if (i < 0) return [l, ""];
        const k = l.slice(0, i).trim();
        const v = l.slice(i + 1).trim();
        return [k, v];
      }),
  );
}
const expected = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
];
const fileEnv = loadEnvAt(repoRoot);
const missing = expected.filter((k) => !(k in process.env) && !(k in fileEnv));

if (missing.length) {
  console.log(" Отсутствуют переменные окружения (.env.local):");
  for (const k of missing) console.log(" - " + k);
  process.exitCode = 0;
} else {
  console.log(" Базовые переменные окружения на месте");
}
