<#
.SYNOPSIS
  One-time setup to run the web app as a container from Azure Container Registry.

.DESCRIPTION
  - Creates an Azure Container Registry (Basic).
  - Grants the CI service principal AcrPush (so GitHub Actions can push images).
  - Grants the web app's system-assigned managed identity AcrPull.
  - Configures the web app to pull with its managed identity, listen on 8080,
    and clears any leftover Node "startup command" so the image CMD is used.

  Run once per environment with `az login` as an Owner.

.PARAMETER ClientId    App/client ID of the CI service principal.
.PARAMETER Environment dev (default) or prod.
#>
param(
  [Parameter(Mandatory = $true)] [string]$ClientId,
  [ValidateSet("dev", "prod")] [string]$Environment = "dev",
  [string]$Location = "centralindia",
  [string]$AcrRg    = "rg-bhr-acr-cin",
  [string]$AcrName  = "acrbhrretcin"
)

$ErrorActionPreference = "Stop"
$appRg = "rg-bhr-ret-$Environment-cin"
$app   = "app-bhr-ret-$Environment-cin"

az account show --query id -o tsv | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Run 'az login' first." }

Write-Host "== Creating ACR $AcrName =="
az group create --name $AcrRg --location $Location | Out-Null
az acr create --name $AcrName --resource-group $AcrRg --sku Basic --location $Location | Out-Null
$acrId = az acr show --name $AcrName --query id -o tsv

Write-Host "== Granting CI service principal AcrPush =="
$spOid = az ad sp show --id $ClientId --query id -o tsv
az role assignment create --assignee-object-id $spOid --assignee-principal-type ServicePrincipal `
  --role AcrPush --scope $acrId 2>$null | Out-Null

Write-Host "== Granting web app managed identity AcrPull =="
$appOid = az webapp identity show --name $app --resource-group $appRg --query principalId -o tsv
if (-not $appOid) {
  $appOid = az webapp identity assign --name $app --resource-group $appRg --query principalId -o tsv
}
az role assignment create --assignee-object-id $appOid --assignee-principal-type ServicePrincipal `
  --role AcrPull --scope $acrId 2>$null | Out-Null

Write-Host "== Configuring web app for container =="
az webapp config appsettings set --name $app --resource-group $appRg `
  --settings WEBSITES_PORT=8080 | Out-Null
# Clear any Node startup command left from the previous (non-container) attempts.
az webapp config set --name $app --resource-group $appRg --startup-file "" | Out-Null
# Pull images using the web app's managed identity (no registry password stored).
$webId = "$(az webapp show -n $app -g $appRg --query id -o tsv)/config/web"
az resource update --ids $webId --set properties.acrUseManagedIdentityCreds=true | Out-Null

Write-Host ""
Write-Host "ACR $AcrName ready. $app will pull via managed identity on port 8080."
Write-Host "Role assignments can take a minute or two to propagate before the first deploy."
