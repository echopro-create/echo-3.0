#!/usr/bin/env node
// tools/fix-homoglyphs.mjs
import fs from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const WRITE = args.has("--write");

// Cyrillic confusables → ASCII Latin
const MAP = new Map(Object.entries({
  // Uppercase
  "А":"A","В":"B","С":"C","Е":"E","Н":"H","К":"K","М":"M","О":"O","Р":"R","Т":"T","Х":"X","У":"Y",
  // Lowercase
  "а":"a","в":"v","с":"s","е":"e","к":"k","м":"m","о":"o","р":"r","т":"t","х":"x","у":"y","н":"n",
  // Extras seen in the wild (Ukr/Bel)
  "І":"I","і":"i"
}));

// Matches a "word" that contains at least one Cyrillic AND at least one ASCII letter
const MIXED_WORD_RE = /\b(?=[\p{Script=Latin}\p{Script=Cyrillic}]*\p{Script=Cyrillic})(?=[\p{Script=Latin}\p{Script=Cyrillic}]*[A-Za-z])[\p{Script=Latin}\p{Script=Cyrillic}]{2,}\b/gu;

function fixToken(token) {
  // Replace only Cyrillic letters that have a Latin twin
  return Array.from(token, ch => MAP.get(ch) ?? ch).join("");
}

function processFile(file) {
  const orig = fs.readFileSync(file, "utf8");
  let changed = false;

  const fixed = orig.replace(MIXED_WORD_RE, (m) => {
    const out = fixToken(m);
    if (out !== m) changed = true;
    return out;
  });

  return { changed, fixed, orig };
}

function run() {
  const root = process.cwd();
  const targets = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const skip = /(^|\\)(node_modules|\.next|dist|build|\.git)(\\|$)/i.test(path.join(dir, entry.name));
        if (!skip) walk(path.join(dir, entry.name));
      } else if (/\.(ts|tsx|md|css)$/i.test(entry.name)) {
        targets.push(path.join(dir, entry.name));
      }
    }
  }

  walk(root);

  let touchedTokens = 0;
  let filesChanged = 0;

  for (const file of targets) {
    const before = fs.readFileSync(file, "utf8");
    let tokensInFile = 0;

    const after = before.replace(MIXED_WORD_RE, (m) => {
      const out = fixToken(m);
      if (out !== m) {
        tokensInFile++;
        touchedTokens++;
      }
      return out;
    });

    if (tokensInFile > 0) {
      filesChanged++;
      if (WRITE) {
        fs.writeFileSync(file + ".bak", before); // keep a safety net
        fs.writeFileSync(file, after);
        console.log("[FIX] wrote:", file, `(tokens: ${tokensInFile})`);
      } else {
        console.log("[DRY] would fix:", file, `(tokens: ${tokensInFile})`);
      }
    }
  }

  const tag = WRITE ? "APPLIED" : "DRY-RUN";
  console.log(`${tag}: files changed=${filesChanged}, tokens touched=${touchedTokens}`);
}

run();
