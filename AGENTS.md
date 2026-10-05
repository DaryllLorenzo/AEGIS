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
libs/          Shared projects (e.g. Aegis.ServiceDefaults)
```

## Commands you will actually use

| Task | Command |
|---|---|
| Run full stack locally | `dotnet aspire run` (from repo root; starts Postgres + MinIO containers, API process, web dev server) |
| Build API | `cd apps/api && dotnet build` |
| Add EF migration | `cd apps/api && dotnet ef migrations add <Name>` (works offline — uses the design-time factory) |
| Web type check | `cd apps/web && npm run typecheck` |
| Web production build | `cd apps/web && npm run build` |
| Lint | `npm run lint` — **no-op** (Next 16 has no `next lint`, no ESLint config). Gates are typecheck + build. |
| Tests | None exist. typecheck + build are the gates. |

## Backend conventions (`apps/api`)

- **Vertical slices**: each feature folder under `Endpoints/<Area>/Features/<Name>/` has
  `<Name>Endpoint.cs` (route, handler binding, exception→HTTP mapping), `<Name>Request.cs`,
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
- **Exceptions → HTTP**: map domain exceptions in the Endpoint (`ValidationProblem` for
  business-rule failures like `NotGroupMemberException`, `ParentDocumentNotFoundException`).
  A bare `NotFound()` hides the actual reason from the UI.

## Migration rules (learned the hard way)

- There is exactly **one** design-time factory: `apps/api/Data/AegisDbContextFactory.cs`.
  Never add a second `IDesignTimeDbContextFactory` — `dotnet ef` fails with a duplicate-key error.
- `dotnet ef migrations remove` needs a live, credentialed DB. If that's unavailable, delete the
  migration `.cs` files and `git checkout` the model snapshot, then re-run `dotnet ef migrations add`.
- A failed migration is transactional — the DB rolls back; fix the migration and just run the app.
- Raw SQL in a migration must quote identifiers (`"Documents"`, `"ParentId"`, `"Version"`).

## Web conventions (`apps/web/src`)

- Routes: `(auth)` group = signed-in AppShell; `/login/*` public; `reviews/[id]/workspace` is a full-screen page.
- API client: `src/lib/api/*.ts` modules (auth, documents, reviews, groups, users, annotations, types, client),
  re-exported from `src/lib/api/index.ts`. All calls go through these — no fetch in components.
- Hooks in `src/hooks/` (`useFetch`, `useDocuments`, `useReviews`, `useGroup`, `useReview`, ...).
- **`AuthUser` shape**: `{ userId, email, displayName, roles }` — use `user.userId`, not `user.id`.
- **Entity pickers**: `GET /api/<area>/select` returning `{ id, label }`. Label = `DisplayName`.
- **Reviews state machine** lives in `src/lib/review-machine.ts` (`nextReviewStatus`,
  `reviewNextAction`, `isReviewOverdue`, `submissionStatusLabel/Class`). Never write a raw
  optimistic status update — go through `updateReview` with the legal transition.
- `PdfAnnotator` is gated: editors pass `readOnly={review.status !== "InProgress"}`; the API
  enforces the same rule on writes (`BulkUpdateAnnotations` → 400).
- Document version lineage: `DocumentDto.version` (server-computed int) drives UI; never compute depth client-side.

## Gotchas

- **EF shadow FKs**: if an entity has a navigation (e.g. `Document.Parent`) but the config uses
  `HasOne<Document>()` *without* the navigation lambda, EF adds a dead shadow FK column
  (`ParentId1`, `AssigneeUserId`). Bind the config with `HasOne(d => d.Parent).WithMany(d => d.Children)`.
- **Numeric enums over the wire**: every new enum needs a client-side normalization in the matching
  `lib/api/*.ts` module (or you get `undefined.toLowerCase()` crashes).
- **New groups**: the creator is added as a member on group creation. Don't rely on membership
  existing in old rows created before this rule.
- `apps/web/AGENTS.md` and `apps/web/CLAUDE.md` are regenerated by `next dev` — heed the
  "NOT the Next.js you know" warning; breaking changes vs. training data. Trust
  `node_modules/next/dist/docs/`, not your memory.

### Project skills (in `.claude/skills/`)

- `aegis-backend` — add a new backend feature/endpoint in the existing vertical-slice style.
- `aegis-migrations` — safe EF migration workflow for this repo, including the pitfalls above.
- `aegis-frontend` — add/modify web client code with the repo's conventions.
