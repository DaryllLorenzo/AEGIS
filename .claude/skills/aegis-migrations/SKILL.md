---
name: aegis-migrations
description: Use when adding EF Core migrations, inspecting or fixing a failed migration, or touching anything under apps/api/Migrations in this repo.
---

# EF migrations in AEGIS

## Ground rules

- **Exactly one design-time factory**: `apps/api/Data/AegisDbContextFactory.cs`.
  A second `IDesignTimeDbContextFactory<AegisDbContext>` anywhere breaks `dotnet ef`
  with "An item with the same key has already been added". Do not create another one.
- The factory reads `ConnectionStrings__aegisdb`; `dotnet ef` can scaffold with no
  live DB (build-time only) but **cannot apply or remove migrations** without a
  real, credentialed connection.
- **`dotnet ef migrations remove` requires a live DB and valid auth.** If unavailable:
  delete the migration `.cs` + `.Designer.cs` files, restore the model snapshot
  (`git checkout -- apps/api/Migrations/AegisDbContextModelSnapshot.cs` if it is dirty),
  then re-run `dotnet ef migrations add`. The snapshot and the migration set must
  stay in sync — applying never syncs the snapshot by itself.
- **Failed migrations roll back.** EF wraps all migration operations in one
  transaction, so after a failure the DB is back to the previous state and you can
  just fix the SQL and restart the API (`MigrateAsync` runs on startup).

## Case sensitivity

EF created tables/columns as quoted identifiers: `"Documents"`, `"Reviews"`,
`"Id"`, `"ParentId"`, `"Version"`, `"AssigneeId"`. **Any raw SQL (`migrationBuilder.Sql`)
must quote identifiers and match case exactly** — `FROM documents` fails with
`42P01: relation "documents" does not exist`.

## Existing data

Add nullable columns and defaults carefully; for data-dependent backfills include
the SQL in the migration (see the recursive-CTE version backfill in
`20261005110538_AddDocumentTypeVersionAndAssigneeId`) and keep it after the
`AddColumn` call, before `CreateIndex`/`AddForeignKey`.

## After changing the model

1. `cd apps/api && dotnet build`
2. If the diff is wrong (extra/missing columns or a spurious shadow FK), your
   entity navigation is usually bound wrong — see the `aegis-backend` skill.
3. `dotnet ef migrations add <Name>`
4. Read the generated `Up`/`Down` before committing.
5. Run the API (`dotnet aspire run` from repo root) to apply it transactionally.
