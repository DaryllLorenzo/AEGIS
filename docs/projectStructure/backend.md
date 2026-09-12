# Backend Structure

## Stack

| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | 10 | Minimal API |
| Entity Framework Core | 10 | ORM |
| PostgreSQL | 18 | Database |
| MediatR | 14.2 | CQRS request/handler pipeline |
| FluentValidation | 12.1 | Input validation |
| Sieve | 2.5 | Filtering, sorting, pagination |
| MinIO | 7.0 | S3-compatible object storage |
| Scalar | 2.17 | OpenAPI documentation UI |
| .NET Aspire | 13.5 | Development orchestration |

## Directory Layout

```
apps/api/
├── Program.cs                          # Composition root (DI + middleware + JWT auth)
├── Configuration/
│   └── ScalarConfiguration.cs          # OpenAPI + Scalar UI setup
├── Data/
│   ├── AegisDbContext.cs               # EF Core DbContext (9 DbSets)
│   └── AegisDbContextFactory.cs        # Design-time factory for dotnet ef
├── Endpoints/
│   ├── Annotations/                    # Annotation CRUD vertical slice
│   │   ├── Data/
│   │   │   ├── Annotation.cs
│   │   │   └── AnnotationConfiguration.cs
│   │   ├── Features/
│   │   │   ├── CreateAnnotation/
│   │   │   ├── DeleteAnnotation/
│   │   │   ├── GetAnnotationById/
│   │   │   └── GetAnnotations/
│   │   └── AnnotationsConfigurations.cs
│   ├── Documents/                      # Document management vertical slice
│   │   ├── Data/
│   │   │   ├── Document.cs
│   │   │   └── DocumentConfiguration.cs
│   │   ├── Features/
│   │   │   ├── CreateDocument/
│   │   │   ├── DeleteDocument/
│   │   │   ├── GetDocumentById/
│   │   │   └── GetDocuments/
│   │   └── DocumentsConfigurations.cs
│   ├── Faculties/                      # Faculty CRUD vertical slice
│   │   ├── Data/
│   │   │   ├── Faculty.cs
│   │   │   └── FacultyConfiguration.cs
│   │   ├── Dtos/
│   │   │   └── FacultyDto.cs
│   │   ├── Exceptions/
│   │   │   └── FacultyNotFoundException.cs
│   │   ├── Features/
│   │   │   ├── CreateFaculty/
│   │   │   ├── GetFaculties/
│   │   │   ├── GetFacultyById/
│   │   │   ├── UpdateFaculty/
│   │   │   └── DeleteFaculty/
│   │   ├── Mappings/
│   │   │   └── ManualFacultyMappings.cs
│   │   ├── Services/
│   │   │   └── FacultySieveProcessor.cs
│   │   └── FacultiesConfigurations.cs
│   ├── Groups/                         # Research groups vertical slice
│   │   ├── Data/
│   │   │   ├── Group.cs
│   │   │   └── GroupConfiguration.cs
│   │   ├── Features/
│   │   │   ├── CreateGroup/
│   │   │   ├── DeleteGroup/
│   │   │   ├── GetGroupById/
│   │   │   ├── GetGroups/
│   │   │   └── UpdateGroup/
│   │   └── GroupsConfigurations.cs
│   ├── Reviews/                        # Review management vertical slice
│   │   ├── Data/
│   │   │   ├── Review.cs
│   │   │   └── ReviewConfiguration.cs
│   │   ├── Features/
│   │   │   ├── CreateReview/
│   │   │   ├── DeleteReview/
│   │   │   ├── GetReviewById/
│   │   │   └── GetReviews/
│   │   └── ReviewsConfigurations.cs
│   ├── Roles/                          # Role management vertical slice
│   │   ├── Data/
│   │   │   ├── Role.cs
│   │   │   └── RoleConfiguration.cs
│   │   └── Features/
│   │       └── GetRoles/
│   ├── Users/                          # Auth + user management
│   │   ├── Data/
│   │   │   ├── User.cs
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── RefreshToken.cs
│   │   │   ├── RefreshTokenConfiguration.cs
│   │   │   ├── GroupUserRole.cs
│   │   │   └── GroupUserRoleConfiguration.cs
│   │   ├── Dtos/
│   │   │   └── UserDto.cs
│   │   ├── Exceptions/
│   │   │   ├── InvalidCredentialsException.cs
│   │   │   └── UserNotFoundException.cs
│   │   ├── Features/
│   │   │   ├── CreateUser/
│   │   │   ├── DeleteUser/
│   │   │   ├── GetUserById/
│   │   │   ├── GetUsers/
│   │   │   ├── GetProtectedResource/
│   │   │   ├── Login/                 # POST /api/users/login (returns access + refresh tokens)
│   │   │   ├── Refresh/               # POST /api/users/refresh (token rotation)
│   │   │   ├── Logout/                # POST /api/users/logout (revokes refresh token)
│   │   │   ├── UpdateUser/
│   │   │   └── WhoAmI/                # GET /api/users/me (validates token)
│   │   ├── Mappings/
│   │   │   └── ManualUserMappings.cs
│   │   ├── Services/
│   │   │   ├── JwtTokenService.cs     # JWT access token generation + validation
│   │   │   ├── RefreshTokenService.cs # Refresh token generation + validation + revocation
│   │   │   └── UserSieveProcessor.cs
│   │   └── UsersConfigurations.cs
│   └── MinIOTestEndpoints.cs           # Test endpoints (remove before prod)
├── Shared/
│   ├── Binding/                        # Model binding helpers
│   ├── Paging/
│   │   ├── PaginatedList.cs            # Generic paginated response
│   │   └── SieveRequest.cs             # Base record with SieveModel
│   └── Storage/
│       ├── IStorageService.cs          # Provider-agnostic contract
│       ├── StoredObject.cs             # Storage metadata DTO
│       └── MinIO/
│           ├── MinIOOptions.cs
│           ├── MinIOStorageService.cs
│           └── MinIOServiceCollectionExtensions.cs
└── Migrations/                         # EF Core migrations (applied on startup)
```

## Architecture: Vertical Slices + CQRS

Each domain feature is a self-contained **slice** under `Endpoints/{SliceName}/`. Slices do not depend on each other.

### Request/Response Flow

```
HTTP Request
  -> Endpoint (Minimal API route handler)
    -> FluentValidation (if present)
      -> MediatR Request
        -> MediatR Handler
          -> DbContext / external services
            -> Response DTO
```

### File Naming Convention

| File | Suffix | Purpose |
|---|---|---|
| `{Feature}Request.cs` | Request | MediatR `IRequest<T>` record |
| `{Feature}Handler.cs` | Handler | MediatR `IRequestHandler<T, R>` class |
| `{Feature}Endpoint.cs` | Endpoint | Minimal API static class with route mapping |
| `{Feature}Validator.cs` | Validator | FluentValidation `AbstractValidator<T>` class |

### Shared Layer (`Shared/`)

Reusable, domain-agnostic code:

- **Shared/Binding/** -- Model binding helpers
- **Shared/Paging/** -- `PaginatedList<T>`, `SieveRequest` (base for paginated queries)
- **Shared/Storage/** -- `IStorageService` contract + MinIO implementation

## Program.cs Wiring

```csharp
// Services
builder.AddServiceDefaults();                          // Aspire (OTel, health, resilience)
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb"); // EF Core + PostgreSQL
builder.AddScalarDocumentation();                      // OpenAPI + Scalar
builder.AddFacultiesModuleServices();                  // MediatR + FluentValidation + Sieve
builder.AddDocumentsModuleServices();
builder.AddReviewsModuleServices();
builder.AddAnnotationsModuleServices();
builder.AddUsersModuleServices();                      // Auth + JWT + Refresh tokens
builder.AddRolesModuleServices();
builder.AddGroupsModuleServices();
builder.Services.AddMinIOStorage(builder.Configuration); // Object storage

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* validate issuer, audience, signing key, lifetime */ });
builder.Services.AddAuthorization();

// Middleware
app.UseExceptionHandler();
app.UseCors(WebCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapScalarDocumentation();
app.MapDefaultEndpoints();                             // /health, /alive
app.MapFacultiesModuleEndpoints();
app.MapDocumentsModuleEndpoints();
app.MapReviewsModuleEndpoints();
app.MapAnnotationsModuleEndpoints();
app.MapUsersModuleEndpoints();                         // /api/users/*
app.MapRolesModuleEndpoints();
app.MapGroupsModuleEndpoints();
```

Each slice exposes two extension methods:
- `Add{Slice}ModuleServices(this WebApplicationBuilder)` -- DI registration
- `Map{Slice}ModuleEndpoints(this IEndpointRouteBuilder)` -- Route mapping

## Authentication

JWT-based with refresh token rotation. See [docs/auth.md](../../docs/auth.md) for full details.

### Services

| Service | Responsibility |
|---|---|
| `JwtTokenService` | Generates and validates JWT access tokens |
| `RefreshTokenService` | Generates, validates, and revokes refresh tokens |

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/login` | No | Login, returns access + refresh token |
| POST | `/api/users/refresh` | No | Renews tokens with valid refresh token |
| POST | `/api/users/logout` | Yes | Revokes the refresh token |
| GET | `/api/users/me` | Yes | Validates that the token is valid |
| POST | `/api/users` | No | Create user |
| GET | `/api/users` | Yes | List users (paginated) |
| GET | `/api/users/{id}` | Yes | Get user by ID |
| PUT | `/api/users/{id}` | Yes | Update user |
| DELETE | `/api/users/{id}` | Yes | Delete user |

### RefreshTokens table

```
Id          GUID (PK)
UserId      GUID (FK -> Users)
Token       VARCHAR(500) UNIQUE
ExpiresAt   TIMESTAMP
IsRevoked   BOOLEAN
CreatedAt   TIMESTAMP
```

## Database

EF Core Code-First with PostgreSQL. Migrations run automatically on startup.

- `AegisDbContext` -- Single context for all entities (9 DbSets: Faculties, Documents, Reviews, Annotations, Users, Roles, Groups, UserRoles, RefreshTokens)
- `AegisDbContextFactory` -- Design-time factory for `dotnet ef` CLI
- Entity configurations in each slice's `Data/ folder` via `IEntityTypeConfiguration<T>`
- Seed data: `AegisUserSeed.SeedAsync()` creates default users and roles on first startup
