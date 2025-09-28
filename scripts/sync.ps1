param([string]$Message = "chore: sync")

# Безопасный синк: подтянуть, закоммитить локальные, ребейзнуть и пушнуть
git fetch --all --prune

$changes = git status --porcelain
if (-not $changes) {
  Write-Host "No changes. Already synced."
  exit 0
}

git add -A

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "chore: sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git commit -m $Message

# Обновиться поверх remote, затем пушнуть текущую HEAD в main
git pull --rebase origin main
git push origin HEAD:main

Write-Host "Synced."