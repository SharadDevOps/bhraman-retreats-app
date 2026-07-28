[CmdletBinding()]
param(
  [ValidateSet("dev", "prod")]
  [string]$Environment = "dev",

  [string]$DatabaseUrl,

  [switch]$SkipAzureFirewall
)

$ErrorActionPreference = "Stop"

function Read-DotEnvValue {
  param(
    [Parameter(Mandatory)]
    [string]$Path,

    [Parameter(Mandatory)]
    [string]$Key
  )

  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match "^\s*$([Regex]::Escape($Key))\s*=\s*(.*)$") {
      return $matches[1].Trim().Trim('"').Trim("'")
    }
  }

  return $null
}

function Invoke-AzureCli {
  param([Parameter(ValueFromRemainingArguments)][string[]]$Arguments)

  & az @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Azure CLI command failed: az $($Arguments -join ' ')"
  }
}

$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$envPath = Join-Path $repositoryRoot ".env"

if (-not $DatabaseUrl) {
  if (-not (Test-Path -LiteralPath $envPath)) {
    throw "DATABASE_URL was not supplied and $envPath does not exist."
  }
  $DatabaseUrl = Read-DotEnvValue -Path $envPath -Key "DATABASE_URL"
}

if (-not $DatabaseUrl) {
  throw "DATABASE_URL is empty."
}

$databaseUri = [Uri]$DatabaseUrl
if ($databaseUri.Scheme -notin @("postgres", "postgresql")) {
  throw "DATABASE_URL must use the postgres:// or postgresql:// protocol."
}

$userInfo = $databaseUri.UserInfo.Split(":", 2)
if ($userInfo.Count -ne 2) {
  throw "DATABASE_URL must contain a username and password."
}

$databaseUser = [Uri]::UnescapeDataString($userInfo[0])
$databasePassword = [Uri]::UnescapeDataString($userInfo[1])
$databasePort = if ($databaseUri.Port -gt 0) { $databaseUri.Port } else { 5432 }
$jdbcUrl = "jdbc:postgresql://{0}:{1}{2}{3}" -f `
  $databaseUri.Host, $databasePort, $databaseUri.AbsolutePath, $databaseUri.Query

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is required. Install or start Docker Desktop and try again."
}
& docker info --format "{{.ServerVersion}}" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Docker Desktop is installed but its engine is not running. Start Docker Desktop and try again."
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "npx is required. Install Node.js dependencies and try again."
}
if (-not $SkipAzureFirewall -and -not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw "Azure CLI is required unless -SkipAzureFirewall is used."
}

$generatedRoot = Join-Path $repositoryRoot ".flyway"
$generatedSql = Join-Path $generatedRoot "sql"
if (-not $generatedRoot.StartsWith($repositoryRoot + [IO.Path]::DirectorySeparatorChar)) {
  throw "Generated Flyway path escaped the repository."
}

if (Test-Path -LiteralPath $generatedRoot) {
  Remove-Item -LiteralPath $generatedRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $generatedSql -Force | Out-Null

$migrationDirectories = Get-ChildItem -LiteralPath (Join-Path $repositoryRoot "prisma\migrations") -Directory |
  Sort-Object Name

foreach ($directory in $migrationDirectories) {
  $match = [Regex]::Match($directory.Name, "^(?<version>\d+)(?:_(?<description>.+))?$")
  $source = Join-Path $directory.FullName "migration.sql"
  if (-not $match.Success -or -not (Test-Path -LiteralPath $source)) {
    continue
  }

  $description = $match.Groups["description"].Value
  if (-not $description) {
    $description = "migration"
  }
  $description = $description -replace "[^A-Za-z0-9_]+", "_"
  $target = Join-Path $generatedSql ("V{0}__{1}.sql" -f $match.Groups["version"].Value, $description)
  Copy-Item -LiteralPath $source -Destination $target
}

if (-not (Get-ChildItem -LiteralPath $generatedSql -Filter "V*.sql" -File)) {
  throw "No Prisma migration SQL files were found."
}

$resourceGroup = "rg-bhr-ret-$Environment-cin"
$serverName = "psql-bhr-ret-$Environment-cin"
$firewallRule = "flyway-inspect-$([Guid]::NewGuid().ToString('N').Substring(0, 10))"
$firewallCreated = $false
$previousDatabaseUrl = $env:DATABASE_URL
$previousFlywayUrl = $env:FLYWAY_URL
$previousFlywayUser = $env:FLYWAY_USER
$previousFlywayPassword = $env:FLYWAY_PASSWORD

try {
  if (-not $SkipAzureFirewall) {
    $clientIp = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 20).Trim()
    Write-Host "Opening temporary Azure PostgreSQL firewall rule for $clientIp..."
    Invoke-AzureCli postgres flexible-server firewall-rule create `
      --resource-group $resourceGroup `
      --name $serverName `
      --rule-name $firewallRule `
      --start-ip-address $clientIp `
      --end-ip-address $clientIp `
      --output none
    $firewallCreated = $true
  }

  $env:FLYWAY_URL = $jdbcUrl
  $env:FLYWAY_USER = $databaseUser
  $env:FLYWAY_PASSWORD = $databasePassword

  Write-Host ""
  Write-Host "Flyway inspection (read-only; Pending is expected because Prisma owns history)"
  docker run --rm `
    --env FLYWAY_URL `
    --env FLYWAY_USER `
    --env FLYWAY_PASSWORD `
    --volume "${generatedSql}:/flyway/sql:ro" `
    --volume "$repositoryRoot/flyway/flyway.conf:/flyway/conf/flyway.conf:ro" `
    flyway/flyway:11.11.2-alpine `
    info
  if ($LASTEXITCODE -ne 0) {
    throw "Flyway inspection failed."
  }

  Write-Host ""
  Write-Host "Prisma migration status (authoritative)"
  $env:DATABASE_URL = $DatabaseUrl
  & npx prisma migrate status
  if ($LASTEXITCODE -ne 0) {
    throw "Prisma migration status check failed."
  }
}
finally {
  if ($null -eq $previousDatabaseUrl) { Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue } else { $env:DATABASE_URL = $previousDatabaseUrl }
  if ($null -eq $previousFlywayUrl) { Remove-Item Env:FLYWAY_URL -ErrorAction SilentlyContinue } else { $env:FLYWAY_URL = $previousFlywayUrl }
  if ($null -eq $previousFlywayUser) { Remove-Item Env:FLYWAY_USER -ErrorAction SilentlyContinue } else { $env:FLYWAY_USER = $previousFlywayUser }
  if ($null -eq $previousFlywayPassword) { Remove-Item Env:FLYWAY_PASSWORD -ErrorAction SilentlyContinue } else { $env:FLYWAY_PASSWORD = $previousFlywayPassword }

  if ($firewallCreated) {
    Write-Host "Removing temporary Azure PostgreSQL firewall rule..."
    try {
      Invoke-AzureCli postgres flexible-server firewall-rule delete `
        --resource-group $resourceGroup `
        --name $serverName `
        --rule-name $firewallRule `
        --yes `
        --output none
    }
    catch {
      Write-Warning "Could not remove temporary firewall rule '$firewallRule': $($_.Exception.Message)"
    }
  }
}
