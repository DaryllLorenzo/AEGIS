-- Runs once, the first time the postgres data volume is created.
-- EF Core migrations own the schema; keep this file for database-level setup only.

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
