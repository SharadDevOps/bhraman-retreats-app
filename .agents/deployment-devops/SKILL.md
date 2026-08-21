# Deployment, Docker & Azure Infrastructure Skill

## 1. Stack & Hosting Architecture
- **Web App**: Azure App Service Linux (`app-bhr-ret-dev-cin`), running Docker container from Azure Container Registry (`acrbhrretcin.azurecr.io/bhraman-retreats:latest`).
- **Database**: Azure Database for PostgreSQL Flexible Server (`psql-bhr-ret-dev-cin`).
- **Storage**: Azure Blob Storage account (`stbhrretdevcin`).

## 2. Docker & Standalone Build
- `Dockerfile`: Multi-stage build producing Next.js standalone server listening on port 8080.
- `next.config.ts`: Configured with `output: "standalone"`.

## 3. CI/CD & Deployment Scripts
- **GitHub Actions** (`.github/workflows/deploy-app.yml`): Triggers on `main` push. Uses Azure OIDC login, builds & pushes container to ACR, applies Prisma migrations via temporary firewall rule, and restarts App Service.
- **Local Deployment Script** (`scripts/deploy-local.ps1`): Powershell script to bundle, migrate, zip with forward-slash paths, and deploy via `az webapp deploy`.

## 4. Crucial Azure App Service Settings
- `WEBSITES_PORT`: `8080`
- `appCommandLine`: Must be empty `""` so the container executes its native `CMD`.
- `DATABASE_URL`: Must have URL-encoded special characters in passwords (`%40` for `@`, `%24` for `$`).
