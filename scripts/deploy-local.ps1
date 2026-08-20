<#
.SYNOPSIS
  Build and deploy the Bhraman Retreats site to Azure App Service directly from
  your machine (no GitHub Actions required). Applies the Postgres schema too.

.DESCRIPTION
  Steps:
    1. pnpm install, prisma generate, next build (standalone)
    2. az login check; open a temporary Postgres firewall rule for THIS machine
    3. prisma migrate deploy against the environment database
    4. remove the temporary firewall rule
    5. assemble the standalone bundle (static, public, prisma client + engine)
    6. zip and `az webapp deploy` to the App Service

  Run from the repo root: .\scripts\deploy-local.ps1 -Environment dev -DbPassword '<pw>'

.PARAMETER Environment  dev (default) or prod.
.PARAMETER DbPassword   The Postgres admin password (TF_VAR_DB_ADMIN_PASSWORD).
#>
param(
  [ValidateSet("dev", "prod")]
  [string]$Environment = "dev",
  [Parameter(Mandatory = $true)]
  [string]$DbPassword
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

$rg     = "rg-bhr-ret-$Environment-cin"
$app    = "app-bhr-ret-$Environment-cin"
$server = "psql-bhr-ret-$Environment-cin"
$fqdn   = "$server.postgres.database.azure.com"
# URL-encode the password so special characters (@, $, etc.) don't break the URL.
$encPw  = [uri]::EscapeDataString($DbPassword)
# Note the ${fqdn} braces: in PowerShell "$fqdn:5432" would be parsed as a
# scope-qualified variable and evaluate to empty, producing an empty-host URL.
$env:DATABASE_URL = "postgresql://bhraman_admin:${encPw}@${fqdn}:5432/bhraman?sslmode=require"

function Assert-LastExit($what) {
  if ($LASTEXITCODE -ne 0) { throw "$what failed (exit $LASTEXITCODE)" }
}

Write-Host "== 1/6 Install + build ==" -ForegroundColor Cyan
# Remove any stale/corrupted build output from previous runs (avoids
# "Cannot find module for page: /_document" errors).
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
pnpm install --frozen-lockfile; Assert-LastExit "pnpm install"
pnpm prisma generate; Assert-LastExit "prisma generate"
pnpm build; Assert-LastExit "next build"

Write-Host "== 2/6 Azure login check ==" -ForegroundColor Cyan
az account show --query name -o tsv | Out-Null

$myIp = (Invoke-RestMethod "https://api.ipify.org").Trim()
Write-Host "Opening temporary Postgres firewall for $myIp"
az postgres flexible-server firewall-rule create `
  --resource-group $rg --name $server `
  --rule-name "local-deploy-temp" `
  --start-ip-address $myIp --end-ip-address $myIp | Out-Null

# Prisma loads .env and it wins over the process env var, so temporarily write
# the Postgres URL into .env for the migration, then restore the original.
$envBackup = $null
if (Test-Path .env) { $envBackup = Get-Content .env -Raw }
try {
  Set-Content -Path .env -Value "DATABASE_URL=`"$($env:DATABASE_URL)`"" -NoNewline

  Write-Host "== 3/6 Apply database migrations ==" -ForegroundColor Cyan
  pnpm prisma migrate deploy; Assert-LastExit "prisma migrate deploy"
}
finally {
  if ($null -ne $envBackup) { Set-Content -Path .env -Value $envBackup -NoNewline }
  else { Remove-Item .env -ErrorAction SilentlyContinue }

  Write-Host "== 4/6 Remove temporary firewall rule ==" -ForegroundColor Cyan
  az postgres flexible-server firewall-rule delete `
    --resource-group $rg --name $server `
    --rule-name "local-deploy-temp" --yes | Out-Null
}

Write-Host "== 5/6 Assemble standalone bundle ==" -ForegroundColor Cyan
Copy-Item -Recurse -Force .next/static .next/standalone/.next/static
if (Test-Path public) { Copy-Item -Recurse -Force public .next/standalone/public }
Copy-Item -Recurse -Force prisma .next/standalone/prisma
# Next standalone already traces @prisma/client + engine into the bundle. With
# pnpm on Windows the real client lives under node_modules/.pnpm, and
# node_modules/.prisma is a symlink that may not exist, so only copy if present.
$prismaClient = Resolve-Path "node_modules/.prisma/client" -ErrorAction SilentlyContinue
if ($prismaClient) {
  New-Item -ItemType Directory -Force -Path .next/standalone/node_modules/.prisma | Out-Null
  Copy-Item -Recurse -Force $prismaClient .next/standalone/node_modules/.prisma/client
}
$prismaPkg = Resolve-Path "node_modules/@prisma/client" -ErrorAction SilentlyContinue
if ($prismaPkg) {
  New-Item -ItemType Directory -Force -Path .next/standalone/node_modules/@prisma | Out-Null
  Copy-Item -Recurse -Force $prismaPkg .next/standalone/node_modules/@prisma/client
}

Write-Host "== 6/6 Configure startup + zip + deploy to $app ==" -ForegroundColor Cyan
# Next standalone must bind to 0.0.0.0 for App Service to reach it.
az webapp config set --resource-group $rg --name $app `
  --startup-file "HOSTNAME=0.0.0.0 node server.js" | Out-Null

# IMPORTANT: Compress-Archive on Windows stores zip entry paths with backslashes.
# When Azure's Linux host extracts the zip with `unzip`, backslashes are treated as
# literal filename characters (not path separators), so the entire directory tree
# collapses flat — node_modules, .next, etc. all disappear. Node.js then can't find
# any modules and exits in ~1 second with code 1.
#
# Fix: use .NET's ZipArchive API directly, replacing every \ with / in entry names.
if (Test-Path app.zip) { Remove-Item app.zip -Force }
Add-Type -Assembly System.IO.Compression
Add-Type -Assembly System.IO.Compression.FileSystem
$bundleRoot = (Resolve-Path ".next/standalone").Path
$zipStream  = [System.IO.File]::Open("$repoRoot\app.zip", [System.IO.FileMode]::Create)
$zip        = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
$files      = Get-ChildItem -Path $bundleRoot -Recurse -File
foreach ($f in $files) {
  $entryName = $f.FullName.Substring($bundleRoot.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
    $zip, $f.FullName, $entryName,
    [System.IO.Compression.CompressionLevel]::Fastest
  ) | Out-Null
}
$zip.Dispose(); $zipStream.Dispose()
$sizeMB = [math]::Round((Get-Item "$repoRoot\app.zip").Length / 1MB, 1)
Write-Host "  → app.zip: $sizeMB MB, $($files.Count) files (forward-slash paths)"

az webapp deploy --resource-group $rg --name $app --src-path app.zip --type zip

Write-Host ""
Write-Host "Deployed. Site: https://$app.azurewebsites.net" -ForegroundColor Green
