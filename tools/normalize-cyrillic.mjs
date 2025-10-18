#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const MAP = new Map(Object.entries({
  'A': 'А', 'a': 'а',
  'B': 'В', 'E': 'Е', 'e': 'е',
  'K': 'К', 'k': 'к',
  'M': 'М', 'm': 'м',
  'H': 'Н', 'O': 'О', 'o': 'о',
  'P': 'Р', 'p': 'р',
  'C': 'С', 'c': 'с',
  'T': 'Т', 't': 'т',
  'X': 'Х', 'x': 'х',
  'Y': 'У', 'y': 'у',
  'V': 'У', // бывает, что V юзают вместо У, смотри по контексту
}));

// Примитивный парсер: меняем только внутри строк и комментариев .ts/.tsx/.css/.md
const exts = new Set(['.ts', '.tsx', '.css', '.md']);
const files = [];

function walk(d) {
  for (const it of fs.readdirSync(d, { withFileTypes: true })) {
    if (it.name === 'node_modules' || it.name.startsWith('.git') || it.name === '.next' || it.name === 'dist' || it.name === 'build') continue;
    const p = path.join(d, it.name);
    if (it.isDirectory()) walk(p);
    else if (exts.has(path.extname(p))) files.push(p);
  }
}
walk(process.cwd());

let touched = 0, changed = 0;

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const before = src;

  // строки: "…", '…', `…`; комментарии: //… и /* … */
  // очень грубо, но безопасно: заменяем только там, где уже есть кириллица поблизости
  src = src.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.*?$|\/\*[\s\S]*?\*\/)/gm,
    (m) => /[\u0400-\u04FF]/.test(m)
      ? m.replace(/[ABEKMHOPCTXVabekmhopctxvy]/g, ch => MAP.get(ch) ?? ch)
      : m
  );

  if (src !== before) {
    changed++;
    touched += (before.length - src.length) !== 0 ? 1 : 0;
    fs.writeFileSync(f, src, 'utf8');
    console.log('[FIX]', f);
  }
}
console.log(`APPLIED: files changed=${changed}`);
