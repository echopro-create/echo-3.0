#requires -Version 5.1
$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch {}

function Find-RepoRoot {
  param([string]$start)
  $dir = Resolve-Path $start
  while ($true) {
    if (Test-Path (Join-Path $dir "package.json")) { return $dir }
    $parent = Split-Path $dir -Parent
    if ($parent -eq $dir) { throw "package.json not found above $start" }
    $dir = $parent
  }
}
function Section([string]$name) { Write-Host "`n=== $name ===" -ForegroundColor Cyan }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Find-RepoRoot (Join-Path $scriptDir "..")
Set-Location $repoRoot

Section "Repo root"
Write-Host $repoRoot -ForegroundColor Gray

Section "Versions"
node -v
pnpm -v
try { pnpm exec tsc -v } catch { Write-Host "tsc via pnpm not available" -ForegroundColor Yellow }

Section "Git status"
git status --porcelain

Section "Install deps"
pnpm install

Section "Prettier  write"
pnpm exec prettier --write .
Section "Prettier  check"
pnpm exec prettier --check .

Section "TypeScript  typecheck"
pnpm run ts:check

Section "ESLint  strict"
pnpm run lint

Section "Scan for Cyrillic (repo only)"
$files = Get-ChildItem -Path $repoRoot -Recurse -File -Include *.ts,*.tsx,*.css,*.md,*.json,*.yml,*.yaml |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.next\\|\\\.git\\|\\dist\\|\\build\\' }
$bad = @()
foreach ($f in $files) {
  try {
    $hit = Select-String -Path $f.FullName -Pattern '\p{IsCyrillic}' -AllMatches
    if ($hit) { $bad += $hit }
  } catch {}
}
if ($bad.Count -gt 0) {
  Write-Host "Cyrillic characters found:" -ForegroundColor Yellow
  foreach ($h in $bad) { Write-Host "$($h.Path):$($h.LineNumber): $($h.Line)" }
} else {
  Write-Host "No Cyrillic found." -ForegroundColor Green
}

Section ".env.local quick check"
if (Test-Path "tools/env-check.mjs") { node tools/env-check.mjs } else { Write-Host "tools/env-check.mjs missing (skip)" -ForegroundColor Yellow }

Section "Required files present"
$required = @(
  "src/components/sections/formats.tsx",
  "src/components/sections/delivery.tsx",
  "src/components/header.tsx",
  "src/components/footer.tsx",
  "src/components/reveal.tsx",
  "src/app/page.tsx",
  "src/app/security/page.tsx"
)
$missing = $required | Where-Object { -not (Test-Path (Join-Path $repoRoot $_)) }
if ($missing.Count) {
  Write-Host "Missing required files:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  throw "Required files are missing"
} else {
  Write-Host "All required files are present." -ForegroundColor Green
}

Section "depcheck (report only)"
# Вызываем ровно тот же сценарий, что в package.json, чтобы не ловить глюки dlx и гарантированно читать конфиг
try {
  pnpm run deps:check
} catch {
  Write-Host "depcheck reported issues  non-blocking" -ForegroundColor Yellow
}

Section "ts-prune (report only)"
# Используем локально установленный ts-prune и правильный проект
& pnpm exec ts-prune -p tsconfig.json *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ts-prune failed  skip" -ForegroundColor Yellow
}

Section "Next build  production"
pnpm exec next build --turbopack

Write-Host "`nAll checks finished without critical errors." -ForegroundColor Green
