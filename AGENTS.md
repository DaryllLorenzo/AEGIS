# AGENTS.md

Guidance for agents working in the AEGIS monorepo. Read `README.md` first for the full setup;
this file captures the conventions and pitfalls that cost time once.

## What this is

AEGIS — academic editorial / graduate integration system. .NET 10 + Next.js 16 monorepo,
Aspire only for local dev orchestration, EF Core + PostgreSQL, MinIO for file storage.

```
apps/api       ASP.NET Core minimal API, MediatR vertical slices (one feature = Endpoint+Request+Validator+Handler)
apps/web       Next.js App Router frontend (TypeScript, App Shell + AuthGuard for the (auth) group)
aspire/        .NET Aspire AppHost (dev orchestration only)
tests/         .NET unit tests (xUnit): Aegis.Api.Tests mirrors the API namespaces
packages/dotnet  Class libraries composed by apps/api: Aegis.Common, Aegis.Email, Aegis.ServiceDefaults, Aegis.Storage
packages/node  npm workspace packages consumed by apps/web: @aegis/domain (DTOs + review-machine + utils), @aegis/api-client (fetch + endpoints)
```

Node deps install from the **repo root** (npm workspaces; one `package-lock.json` at the root —
never add per-app lockfiles).

## Commands you will actually use

| Task                                      | Command                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Install node deps                         | `npm install` (from repo root — installs every workspace)                                              |
| Run full stack locally                    | `dotnet aspire run` (from repo root; starts Postgres + MinIO containers, API process, web dev server)  |
| Build API                                 | `cd apps/api && dotnet build`                                                                          |
| Add EF migration                          | `cd apps/api && dotnet ef migrations add <Name>` (works offline — uses the design-time factory)        |
| Web type check                            | `npm run typecheck` (all workspaces) or `npm run typecheck -w @aegis/web`                              |
| Web production build                      | `npm run build -w @aegis/web`                                                                          |
| Lint                                      | `npm run lint` — ESLint flat config at repo root (next/core-web-vitals + typescript + prettier).       |
| Format                                    | `npm run format` / `npm run format:check` — Prettier (config `.prettierrc`, respects `.editorconfig`). |
| Tests                                     | `dotnet test` (repo root, all projects) or `dotnet test tests/Aegis.Api.Tests` — .NET unit tests.      |
| **CI gate — always run before finishing** | See below. Must exit 0.                                                                                |

### CI gate — run this always before you finish

CI is `.github/workflows/net-code-quality.yml` (.NET) and
`.github/workflows/node-code-quality.yml` (node). Run **both** sets from the repo root.

.NET:

```bash
dotnet restore
dotnet format --verify-no-changes --no-restore
dotnet build --no-restore --configuration Release \
  -p:TreatWarningsAsErrors=true \
  -p:AnalysisMode=Recommended \
  -p:EnforceCodeStyleInBuild=true
dotnet test --no-build --configuration Release
```

Node (run whenever you touched `apps/web/`, `packages/node/` or root node config):

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build -w @aegis/web
```

- Plain `dotnet build` is **not** the gate: it uses `AnalysisMode=Default`, so it passes while CI
  (Recommended-level rules + `dotnet format`) fails.
- `AnalysisMode` stays `Recommended`. Never `All` — it enables library-only rules (ConfigureAwait,
  public→internal) and fails the build with hundreds of errors.
- `System.Security.Cryptography.Pkcs` is pinned to 10.0.13 in `Directory.Packages.props` because
  PDFsharp drags in the vulnerable 8.0.1 (NU1902/NU1903 audit findings; keep them at zero).
- After touching any `.cs` file, run `dotnet format --no-restore` (it fixes final newline,
  import order and IDE0011 braces).

## Backend conventions (`apps/api`)

- **Shared code**: cross-cutting libraries live in `packages/dotnet/` (`Aegis.Common`,
  `Aegis.Email`, `Aegis.Result`, `Aegis.ServiceDefaults`, `Aegis.Storage`); `apps/api/Common/`
  keeps only app-specific helpers (e.g. `RequireAdminFilter`, which needs the DbContext).
  Add a new package only for a new external dependency or a second consumer — a new folder
  alone is not a reason.
- **Vertical slices**: each feature folder under `Modules/<Area>/Features/<Name>/` has
  `<Name>Endpoint.cs` (route, handler binding, result→HTTP mapping), `<Name>Request.cs`,
  `<Name>Validator.cs`, `<Name>Handler.cs`. Areas register endpoints in their
  `<Area>Configurations.cs` (`Map<Area>Module` extension in `Program.cs`).
- **EF config**: one `IEntityTypeConfiguration` per entity under `Data/` (`<Entity>Configuration.cs`),
  discovered by `AegisDbContext`. **Table and column names are quoted and case-sensitive**
  (`"Documents"`, `"ParentId"`) — raw SQL must quote them.
- **Enumerations** (`ReviewStatus`, `DocumentType`) are stored as ints and serialized as **numbers**
  over the wire. The web client normalizes them (`normalizeReviewStatus`, `normalizeDocumentType`).
- **Sieve** handles paging/filtering on list endpoints (`SieveRequest`, `PaginatedList<T>`).
- **Auth**: JWT bearer; handlers needing the current user inject `IHttpContextAccessor`
  and parse `ClaimTypes.NameIdentifier` (same pattern in `CreateDocumentHandler`).
- **Result pattern → HTTP**: expected failures never throw. Handlers return
  `Aegis.Common.Result.Result<T>` with `Error.NotFound/Validation/Unauthorized/Forbidden/Failure`
  (each error carries a code, message and optional field errors); the Endpoint maps it with a
  helper from `apps/api/Common/Results/ResultHttpExtensions.cs` (`ToOkOrNotFound`,
  `ToCreatedOrValidation`, `ToOkValidationOrForbidden`, …). Field-keyed `ValidationProblem`
  keeps the reason visible to the UI; a bare `NotFound()` hides it. Exceptions are reserved for
  bugs and infra failures (e.g. missing role seed → 500 via `UseExceptionHandler`).

## Test conventions (`tests/`)

- **Unit tests only** (`Aegis.Api.Tests`, xUnit): one test class per handler/validator, mirroring
  the API namespace under `Modules/…`. Naming: `Handle_Scenario_Expected`.
- **What gets tested**: only files with business rules that return `Error.*` (review transitions,
  auth, version lineage, critical validators, Result→HTTP mapping). Skip `Get*`/Sieve endpoints,
  trivial DTO mappings and adapters (Email/MinIO) — no boilerplate tests for CRUD wiring.
- **No mock libraries**: `Fixtures/TestDb` (EF InMemory `AegisDbContext`), `Fixtures/HttpContextFactory`
  (claims), `Fixtures/TestConfig` (Jwt settings), `Fixtures/FakeStorageService`. Add a fixture only
  when a third one is needed for the same reason.
- **Pure logic before handlers**: rules embedded in handlers get extracted to a static class in the
  feature's `Data/` folder (e.g. `ReviewTransitions.CanTransition`) and tested without EF.
- Tests run in CI after the build: `dotnet test --no-build --configuration Release`.

## Migration rules (learned the hard way)

- There is exactly **one** design-time factory: `apps/api/Data/AegisDbContextFactory.cs`.
  Never add a second `IDesignTimeDbContextFactory` — `dotnet ef` fails with a duplicate-key error.
- `dotnet ef migrations remove` needs a live, credentialed DB. If that's unavailable, delete the
  migration `.cs` files and `git checkout` the model snapshot, then re-run `dotnet ef migrations add`.
- A failed migration is transactional — the DB rolls back; fix the migration and just run the app.
- Raw SQL in a migration must quote identifiers (`"Documents"`, `"ParentId"`, `"Version"`).

## Web conventions (`apps/web/src`)

- Routes: `(auth)` group = signed-in AppShell; `/login/*` public; `reviews/[id]/workspace` is a full-screen page.
- **Shared packages**: DTO types + `review-machine` + display utils come from `@aegis/domain`;
  `fetch`/auth-token plumbing and endpoint functions from `@aegis/api-client` (source-only —
  they are wired through `transpilePackages` in `next.config.ts`; never import them via a
  path into `packages/node/`). All HTTP calls go through `@aegis/api-client` — no fetch in components.
- **API base URL**: the app injects it once via `setApiBaseUrl(...)` in `src/lib/api-config.ts`
  (imported by `Providers.tsx`); packages read `getApiBaseUrl()`, they never read `process.env`.
- Hooks in `src/hooks/` (`useFetch`, `useDocuments`, `useReviews`, `useGroup`, `useReview`, ...).
- **`AuthUser` shape**: `{ userId, email, displayName, roles }` — use `user.userId`, not `user.id`.
- **Entity pickers**: `GET /api/<area>/select` returning `{ id, label }`. Label = `DisplayName`.
- **Reviews state machine** lives in `@aegis/domain` (`nextReviewStatus`,
  `reviewNextAction`, `isReviewOverdue`, `submissionStatusLabel/Class`). Never write a raw
  optimistic status update — go through `updateReview` with the legal transition.
- `PdfAnnotator` is gated: editors pass `readOnly={review.status !== "InProgress"}`; the API
  enforces the same rule on writes (`BulkUpdateAnnotations` → 400).
- Document version lineage: `DocumentDto.version` (server-computed int) drives UI; never compute depth client-side.

## Gotchas

- **EF shadow FKs**: if an entity has a navigation (e.g. `Document.Parent`) but the config uses
  `HasOne<Document>()` _without_ the navigation lambda, EF adds a dead shadow FK column
  (`ParentId1`, `AssigneeUserId`). Bind the config with `HasOne(d => d.Parent).WithMany(d => d.Children)`.
- **Numeric enums over the wire**: every new enum needs a client-side normalization in the
  matching `packages/node/api-client/src/api/*.ts` module (or you get `undefined.toLowerCase()` crashes).
- **New groups**: the creator is added as a member on group creation. Don't rely on membership
  existing in old rows created before this rule.
- **One npm lockfile at the root**: adding a `package-lock.json` inside a workspace breaks
  `npm ci` in CI and the Docker build. Same for `.next` or `node_modules` inside a workspace
  after moving to root installs — delete and reinstall from the root.
- **`next lint` no longer exists** in Next 16; linting is the ESLint CLI with the root
  `eslint.config.mjs`. Don't add an `eslint` key to `next.config.ts`.
- **Web Docker build context is the repo root**: `docker build -f apps/web/Dockerfile .`
  (compose and the AppHost point there too) because the image needs `packages/node`.
- `apps/web/AGENTS.md` and `apps/web/CLAUDE.md` are regenerated by `next dev` — heed the
  "NOT the Next.js you know" warning; breaking changes vs. training data. Trust
  `node_modules/next/dist/docs/`, not your memory.

### Project skills (in `.claude/skills/`)

- `aegis-backend` — add a new backend feature/endpoint in the existing vertical-slice style.
- `aegis-migrations` — safe EF migration workflow for this repo, including the pitfalls above.
- `aegis-frontend` — add/modify web client code with the repo's conventions.
