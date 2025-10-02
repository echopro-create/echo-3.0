Param(
  [string]$Message = "chore: sync"
)
Set-Location -Path (Split-Path $PSCommandPath -Parent) | Out-Null
Set-Location -Path ..
git add -A
git commit -m $Message
git push origin main
