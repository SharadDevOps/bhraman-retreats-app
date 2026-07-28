# Flyway migration inspection

Prisma remains the migration owner for this application. Applied migration
state is stored in PostgreSQL's `_prisma_migrations` table and deployment
continues to use `prisma migrate deploy`.

Flyway is configured here as a read-only inspection companion:

- the check script copies Prisma SQL migrations to an ignored temporary folder
  using Flyway-compatible filenames;
- `flyway info` verifies connectivity and shows how Flyway resolves the local
  SQL files;
- `prisma migrate status` performs the authoritative applied/pending check;
- the script never calls `flyway migrate`, `baseline`, `repair`, or `clean`;
- no `flyway_schema_history` table is created.

Run from the repository root:

```powershell
npm run db:migrations:check
```

The script reads `DATABASE_URL` from the ignored `.env` file, temporarily
allows the current public IP through the existing Azure PostgreSQL firewall,
and removes that rule in a `finally` block.

Options:

```powershell
.\scripts\check-db-migrations.ps1 -Environment dev
.\scripts\check-db-migrations.ps1 -Environment prod
.\scripts\check-db-migrations.ps1 -SkipAzureFirewall
.\scripts\check-db-migrations.ps1 -DatabaseUrl $env:DATABASE_URL
```

Requirements:

- Docker Desktop
- Azure CLI authenticated to the target subscription (unless
  `-SkipAzureFirewall` is used)
- Node dependencies installed for the Prisma status check
