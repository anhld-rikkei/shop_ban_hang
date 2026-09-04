# Copy the LienStore source to TrueNAS over SSH (Windows PowerShell), excluding node_modules/.next/local DB.
# Usage:  .\deploy\push-source-to-truenas.ps1 -NasHost 192.168.1.10 -User truenas_admin -Dest /mnt/tank/apps/lienstore/src
# Requires OpenSSH client (built into Windows 10/11) and SSH enabled on TrueNAS (System → Services → SSH).
param(
  [Parameter(Mandatory = $true)] [string] $NasHost,
  [string] $User = "truenas_admin",
  [string] $Dest = "/mnt/tank/apps/lienstore/src"
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archive = Join-Path $env:TEMP "lienstore-src-$stamp.tar.gz"

Write-Host "== packing source from $root"
# tar.exe ships with Windows 10+; exclude build output, deps, env files and the local SQLite DB.
& tar.exe -czf $archive -C $root `
  --exclude=node_modules --exclude=.next --exclude=.git --exclude=out `
  --exclude=".env*" --exclude="data/*.db" --exclude="data/*.db-*" --exclude=docs/research --exclude=docs/design-references `
  .
if ($LASTEXITCODE -ne 0) { throw "tar failed" }
Write-Host ("   {0:N1} MB" -f ((Get-Item $archive).Length / 1MB))

Write-Host "== uploading to $User@$NasHost`:$Dest"
& ssh "$User@$NasHost" "mkdir -p '$Dest' && rm -rf '$Dest'/* '$Dest'/.[!.]* 2>/dev/null || true"
& scp $archive "$User@$NasHost`:/tmp/lienstore-src.tar.gz"
& ssh "$User@$NasHost" "tar -xzf /tmp/lienstore-src.tar.gz -C '$Dest' && rm /tmp/lienstore-src.tar.gz && ls '$Dest'"
Remove-Item $archive -Force

Write-Host ""
Write-Host "Done. Next, on the NAS:"
Write-Host "  ssh $User@$NasHost 'sh $Dest/deploy/truenas-build.sh $Dest'"
Write-Host "then install deploy/truenas-app.local.yaml via Apps → Discover Apps → Install via YAML."
