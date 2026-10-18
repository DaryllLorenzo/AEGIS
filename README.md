# AEGIS

**A**cademic **E**ditorial & **G**raduate **I**ntegration **S**ystem — from master's thesis to
scientific breakthrough. All in one place.

Monorepo: .NET 10 (ASP.NET Core + EF Core + PostgreSQL 18) for the API, Next.js 16 + React 19
for the web app, [.NET Aspire](https://aka.ms/aspire) for local orchestration, MinIO for
file storage.

## Structure

```
.
├── apps/
│   ├── api/                          # ASP.NET Core minimal API (MediatR vertical slices)
│   │   ├── Common/Authz/             # RequireAdmin endpoint filter (needs the DbContext)
│   │   ├── Common/Results/           # Result→HTTP mapping helpers (TypedResults unions)
│   │   ├── Configuration/            # OpenAPI + Scalar setup
│   │   ├── Data/                     # EF Core DbContext + design-time factory
│   │   ├── Modules/                  # Annotations, Documents, Faculties, Groups,
│   │   │                             # Reviews, Roles, Users — one folder per slice
│   │   ├── Migrations/               # Applied automatically on startup
│   │   ├── Dockerfile                # Multi-stage build, context = repository root
│   │   └── Program.cs                # Composition root (DI, CORS, JWT, seeding)
│   └── web/                          # Next.js App Router frontend
│       └── src/                      # app/ (auth group + public login), components/,
│                                     # hooks/, lib/, styles/
├── packages/
│   ├── dotnet/                       # Class libraries composed by apps/api
│   │   ├── Aegis.Common/             # Paging + Selection (PaginatedList<T>, SieveRequest)
│   │   ├── Aegis.Email/              # IEmailSender contract + SMTP implementation
│   │   ├── Aegis.Result/             # Result/Error pattern (no exceptions for expected failures)
│   │   ├── Aegis.ServiceDefaults/    # Aspire defaults: OpenTelemetry, health checks
│   │   └── Aegis.Storage/            # IStorageService contract + MinIO implementation
│   └── node/                         # npm workspace packages consumed by apps/web
│       ├── domain/                   # @aegis/domain — DTO types, review-machine, display utils
│       └── api-client/               # @aegis/api-client — typed fetch + endpoint modules
├── aspire/
│   └── Aegis.AppHost/                # Dev orchestration only — never deployed
├── tests/
│   └── Aegis.Api.Tests/              # xUnit unit tests (mirrors the API namespaces)
├── infra/postgres/init/              # One-shot DB bootstrap SQL (extension creation)
├── AEGIS.slnx                        # Solution
├── Directory.Build.props             # Shared MSBuild properties
├── Directory.Packages.props          # Central Package Management (one version list)
└── docker-compose.yml                # Self-hosting stack
```

`apps/` holds what ships; `packages/dotnet/` holds the libraries the API composes and
`packages/node/` the shared TypeScript packages the web app composes. A new package needs
a new external dependency or a second consumer — a new folder alone is not a reason.

## Getting started

Prerequisites: [.NET SDK 10](https://learn.microsoft.com/dotnet), Node.js 22+, and Docker
(a container runtime for PostgreSQL).

```bash
git clone <repository-url>
cd AEGIS

dotnet tool restore   # pinned Aspire CLI + dotnet-ef
npm install           # node workspaces (apps/web + packages/node/*), one root lockfile
dotnet aspire run     # Postgres container + API + web dev server
```

That is the whole setup. The API applies its EF Core migrations on startup and seeds two
users: `admin@aegis.com` / `Admin1234!` and `student@aegis.com` / `Student1234!`.
The first run pulls images and installs packages; after that a warm start takes ~15s.

| Resource                            | Address               |
| ----------------------------------- | --------------------- |
| API (Scalar reference at `/scalar`) | http://localhost:5180 |
| Web                                 | http://localhost:3000 |

Day-to-day:

```bash
dotnet aspire run                    # everything, attached to the terminal
dotnet aspire logs <resource>        # tail one resource
dotnet build AEGIS.slnx              # build all .NET projects
dotnet test                          # run the unit tests (xUnit, tests/)
npm run typecheck                    # type-check every node workspace
npm run lint && npm run format       # ESLint + Prettier on the frontend
dotnet ef migrations add <Name> --project apps/api   # new migration (no DB needed)
```

Self-hosting: `cp .env.example .env`, set the secrets, then `docker compose up -d --build`.

## License

[MIT](LICENSE) © Daryll
