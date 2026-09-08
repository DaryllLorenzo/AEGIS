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
├── Program.cs                          # Composition root (DI + middleware)
├── GlobalUsings.cs                     # (deleted - explicit usings only)
├── Configuration/
│   └── ScalarConfiguration.cs          # OpenAPI + Scalar UI setup
├── Data/
│   ├── AegisDbContext.cs               # EF Core DbContext
│   ├── AegisDbContextFactory.cs        # Design-time factory for dotnet ef
│   └── Note.cs                         # Placeholder entity
├── Endpoints/
│   ├── Faculties/                      # <-- Example slice (vertical)
│   │   ├── Data/
│   │   │   ├── Faculty.cs              # Entity
│   │   │   └── FacultyConfiguration.cs # EF Core config
│   │   ├── Dtos/
│   │   │   └── FacultyDto.cs           # Response DTO
│   │   ├── Exceptions/
│   │   │   └── FacultyNotFoundException.cs
│   │   ├── Features/
│   │   │   ├── GetFaculties/           # GET /api/faculties (paginated)
│   │   │   │   ├── GetFacultiesRequest.cs
│   │   │   │   ├── GetFacultiesHandler.cs
│   │   │   │   └── GetFacultiesEndpoint.cs
│   │   │   ├── GetFacultyById/         # GET /api/faculties/{id}
│   │   │   │   ├── GetFacultyByIdRequest.cs
│   │   │   │   ├── GetFacultyByIdHandler.cs
│   │   │   │   └── GetFacultyByIdEndpoint.cs
│   │   │   ├── CreateFaculty/          # POST /api/faculties
│   │   │   │   ├── CreateFacultyRequest.cs
│   │   │   │   ├── CreateFacultyHandler.cs
│   │   │   │   ├── CreateFacultyValidator.cs
│   │   │   │   └── CreateFacultyEndpoint.cs
│   │   │   ├── UpdateFaculty/          # PUT /api/faculties/{id}
│   │   │   │   ├── UpdateFacultyRequest.cs
│   │   │   │   ├── UpdateFacultyHandler.cs
│   │   │   │   ├── UpdateFacultyValidator.cs
│   │   │   │   └── UpdateFacultyEndpoint.cs
│   │   │   └── DeleteFaculty/          # DELETE /api/faculties/{id}
│   │   │       ├── DeleteFacultyRequest.cs
│   │   │       ├── DeleteFacultyHandler.cs
│   │   │       └── DeleteFacultyEndpoint.cs
│   │   ├── Mappings/
│   │   │   └── ManualFacultyMappings.cs
│   │   ├── Services/
│   │   │   └── FacultySieveProcessor.cs
│   │   └── FacultiesConfigurations.cs  # DI + endpoint group mapping
│   └── MinIOTestEndpoints.cs           # Test endpoints (remove before prod)
├── Shared/
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
└── Migrations/                         # EF Core migrations
```

## Architecture: Vertical Slices + CQRS

Each domain feature is a self-contained **slice** under `Endpoints/{SliceName}/`. Slices do not depend on each other.

### Request/Response Flow

```
HTTP Request
  → Endpoint (Minimal API route handler)
    → FluentValidation (if present)
      → MediatR Request
        → MediatR Handler
          → DbContext / external services
            → Response DTO
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

- **Shared/Paging/** -- `PaginatedList<T>`, `SieveRequest` (base for paginated queries)
- **Shared/Storage/** -- `IStorageService` contract + MinIO implementation

## Program.cs Wiring

```csharp
// Services
builder.AddServiceDefaults();                          // Aspire (OTel, health, resilience)
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb"); // EF Core + PostgreSQL
builder.AddScalarDocumentation();                      // OpenAPI + Scalar
builder.AddFacultiesModuleServices();                  // MediatR + FluentValidation + Sieve
builder.Services.AddMinIOStorage(builder.Configuration); // Object storage

// Middleware
app.UseExceptionHandler();
app.UseCors(WebCorsPolicy);
app.MapScalarDocumentation();
app.MapDefaultEndpoints();                             // /health, /alive
app.MapFacultiesModuleEndpoints();                     // /api/faculties
```

Each slice exposes two extension methods:
- `Add{Slice}ModuleServices(this WebApplicationBuilder)` -- DI registration
- `Map{Slice}ModuleEndpoints(this IEndpointRouteBuilder)` -- Route mapping

## Database

EF Core Code-First with PostgreSQL. Migrations run automatically on startup.

- `AegisDbContext` -- Single context for all entities
- `AegisDbContextFactory` -- Design-time factory for `dotnet ef` CLI
- Entity configurations in each slice's `Data/` folder via `IEntityTypeConfiguration<T>`
