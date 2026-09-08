# Adding a New Slice to the Backend

This guide walks through creating a new vertical slice (e.g., `Documents`) following the established patterns.

## Step 1: Create the Entity

Create `Endpoints/{SliceName}/Data/{EntityName}.cs`:

```csharp
namespace Aegis.Api.Endpoints.Documents.Data;

public sealed class Document
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? MimeType { get; set; }
    public long FileSize { get; set; }
    public Guid FacultyId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
```

## Step 2: Create the EF Core Configuration

Create `Endpoints/{SliceName}/Data/{EntityName}Configuration.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Documents.Data;

public sealed class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Name)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(d => d.MimeType)
            .HasMaxLength(100);

        builder.HasIndex(d => d.Name);
        builder.HasIndex(d => d.FacultyId);
        builder.HasIndex(d => d.CreatedAt);
    }
}
```

## Step 3: Register in DbContext

Add the `DbSet` and configuration to `Data/AegisDbContext.cs`:

```csharp
using Aegis.Api.Endpoints.Documents.Data;

public class AegisDbContext(…) : DbContext(…)
{
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ... existing configs ...
        modelBuilder.ApplyConfiguration(new DocumentConfiguration());
    }
}
```

## Step 4: Create the DTO

Create `Endpoints/{SliceName}/Dtos/{EntityName}Dto.cs`:

```csharp
namespace Aegis.Api.Endpoints.Documents.Dtos;

public sealed record DocumentDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? MimeType { get; init; }
    public long FileSize { get; init; }
    public Guid FacultyId { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
```

## Step 5: Create the Exception

Create `Endpoints/{SliceName}/Exceptions/{EntityName}NotFoundException.cs`:

```csharp
namespace Aegis.Api.Endpoints.Documents.Exceptions;

public sealed class DocumentNotFoundException : Exception
{
    public DocumentNotFoundException(Guid id)
        : base($"Document with ID '{id}' was not found.")
    {
    }
}
```

## Step 6: Create the Features

Each feature is a folder under `Features/` with 3-4 files.

### 6a. GET List (paginated with Sieve)

**Request** -- `Features/GetDocuments/GetDocumentsRequest.cs`:
```csharp
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

public sealed record GetDocumentsRequest : SieveRequest, IRequest<PaginatedList<DocumentDto>>;
```

**Handler** -- `Features/GetDocuments/GetDocumentsHandler.cs`:
```csharp
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

public sealed class GetDocumentsHandler : IRequestHandler<GetDocumentsRequest, PaginatedList<DocumentDto>>
{
    private readonly AegisDbContext _db;
    private readonly DocumentSieveProcessor _sieve;

    public GetDocumentsHandler(AegisDbContext db, DocumentSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<DocumentDto>> Handle(GetDocumentsRequest request, CancellationToken ct)
    {
        var query = _db.Documents.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(d => new DocumentDto
            {
                Id = d.Id,
                Name = d.Name,
                MimeType = d.MimeType,
                FileSize = d.FileSize,
                FacultyId = d.FacultyId,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
            })
            .ToListAsync(ct);

        return new PaginatedList<DocumentDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
```

**Endpoint** -- `Features/GetDocuments/GetDocumentsEndpoint.cs`:
```csharp
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Sieve.Models;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

internal static class GetDocumentsEndpoint
{
    internal const string Name = "GetDocuments";

    internal static RouteHandlerBuilder MapGetDocumentsEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(DocumentsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of documents.");

        static async Task<Ok<PaginatedList<DocumentDto>>> Handle(
            [AsParameters] GetDocumentsParameters parameters,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var sieve = new SieveModel
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                Filters = parameters.Filters,
                Sorts = parameters.Sorts,
            };

            var result = await sender.Send(new GetDocumentsRequest { Sieve = sieve }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetDocumentsParameters
{
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
```

### 6b. GET by ID

**Request** -- `Features/GetDocumentById/GetDocumentByIdRequest.cs`:
```csharp
using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

public sealed record GetDocumentByIdRequest(Guid Id) : IRequest<DocumentDto>;
```

**Handler** -- `Features/GetDocumentById/GetDocumentByIdHandler.cs`:
```csharp
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

public sealed class GetDocumentByIdHandler : IRequestHandler<GetDocumentByIdRequest, DocumentDto>
{
    private readonly AegisDbContext _db;

    public GetDocumentByIdHandler(AegisDbContext db) => _db = db;

    public async Task<DocumentDto> Handle(GetDocumentByIdRequest request, CancellationToken ct)
    {
        var doc = await _db.Documents.FindAsync([request.Id], ct)
            ?? throw new DocumentNotFoundException(request.Id);

        return new DocumentDto
        {
            Id = doc.Id,
            Name = doc.Name,
            MimeType = doc.MimeType,
            FileSize = doc.FileSize,
            FacultyId = doc.FacultyId,
            CreatedAt = doc.CreatedAt,
            UpdatedAt = doc.UpdatedAt,
        };
    }
}
```

**Endpoint** -- Follow the same pattern as `GetFacultyByIdEndpoint.cs`.

### 6c. CREATE (with FluentValidation)

**Request** -- `Features/CreateDocument/CreateDocumentRequest.cs`:
```csharp
using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed record CreateDocumentRequest : IRequest<DocumentDto>
{
    public required string Name { get; init; }
    public string? MimeType { get; init; }
    public Guid FacultyId { get; init; }
}
```

**Validator** -- `Features/CreateDocument/CreateDocumentValidator.cs`:
```csharp
using FluentValidation;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed class CreateDocumentValidator : AbstractValidator<CreateDocumentRequest>
{
    public CreateDocumentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Document name is required.")
            .MaximumLength(300).WithMessage("Name must not exceed 300 characters.");

        RuleFor(x => x.FacultyId)
            .NotEmpty().WithMessage("Faculty ID is required.");
    }
}
```

**Handler** -- `Features/CreateDocument/CreateDocumentHandler.cs`:
```csharp
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed class CreateDocumentHandler : IRequestHandler<CreateDocumentRequest, DocumentDto>
{
    private readonly AegisDbContext _db;

    public CreateDocumentHandler(AegisDbContext db) => _db = db;

    public async Task<DocumentDto> Handle(CreateDocumentRequest request, CancellationToken ct)
    {
        var document = new Document
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            MimeType = request.MimeType,
            FacultyId = request.FacultyId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync(ct);

        return new DocumentDto
        {
            Id = document.Id,
            Name = document.Name,
            MimeType = document.MimeType,
            FileSize = document.FileSize,
            FacultyId = document.FacultyId,
            CreatedAt = document.CreatedAt,
        };
    }
}
```

**Endpoint** -- Follow the same pattern as `CreateFacultyEndpoint.cs` (validate with `IValidator<T>`, return `Created<T>` or `ValidationProblem`).

### 6d. UPDATE

**Request** -- Only updatable fields. ID comes from route:
```csharp
using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.UpdateDocument;

public sealed record UpdateDocumentRequest(Guid Id, string Name, string? MimeType) : IRequest<DocumentDto>;
```

**Endpoint** -- Merges route `id` with body, creates the request:
```csharp
static async Task<Results<Ok<DocumentDto>, NotFound, ValidationProblem>> Handle(
    Guid id,
    UpdateDocumentBody body,      // ← body sin el Id
    ISender sender,
    IValidator<UpdateDocumentRequest> validator,
    CancellationToken ct)
{
    var request = new UpdateDocumentRequest(id, body.Name, body.MimeType);
    // validate, send, return...
}

internal sealed record UpdateDocumentBody
{
    public required string Name { get; init; }
    public string? MimeType { get; init; }
}
```

### 6e. DELETE

Follow the same pattern as `DeleteFaculty`. Returns `204 No Content` on success, `404 NotFound` if not found.

## Step 7: Create the Sieve Processor

Create `Endpoints/{SliceName}/Services/{EntityName}SieveProcessor.cs`:

```csharp
using Aegis.Api.Endpoints.Documents.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Documents.Services;

public sealed class DocumentSieveProcessor : SieveProcessor
{
    public DocumentSieveProcessor(IOptions<SieveOptions> options) : base(options) { }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Document>(d => d.Name).CanFilter().CanSort();
        mapper.Property<Document>(d => d.FacultyId).CanFilter();
        mapper.Property<Document>(d => d.CreatedAt).CanSort();
        return mapper;
    }
}
```

## Step 8: Create the Configuration File

Create `Endpoints/{SliceName}/{SliceName}Configurations.cs`:

```csharp
using Aegis.Api.Endpoints.Documents.Features.CreateDocument;
using Aegis.Api.Endpoints.Documents.Features.DeleteDocument;
using Aegis.Api.Endpoints.Documents.Features.GetDocumentById;
using Aegis.Api.Endpoints.Documents.Features.GetDocuments;
using Aegis.Api.Endpoints.Documents.Features.UpdateDocument;
using Aegis.Api.Endpoints.Documents.Services;

namespace Aegis.Api.Endpoints.Documents;

internal static class DocumentsConfigurations
{
    public const string Tag = "Documents";
    public const string DocumentsPrefixUri = "api/documents";

    internal static WebApplicationBuilder AddDocumentsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<DocumentSieveProcessor>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateDocumentValidator>();
        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetDocumentsRequest>());
        return builder;
    }

    internal static IEndpointRouteBuilder MapDocumentsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var documents = endpoints.MapGroup(DocumentsPrefixUri);
        documents.MapGetDocumentsEndpoint();
        documents.MapGetDocumentByIdEndpoint();
        documents.MapCreateDocumentEndpoint();
        documents.MapUpdateDocumentEndpoint();
        documents.MapDeleteDocumentEndpoint();
        return endpoints;
    }
}
```

## Step 9: Wire Up in Program.cs

Add to `Program.cs`:

```csharp
using Aegis.Api.Endpoints.Documents;

// Services
builder.AddDocumentsModuleServices();

// Endpoints (after app = builder.Build())
app.MapDocumentsModuleEndpoints();
```

## Step 10: Create the Migration

```bash
dotnet ef migrations add AddDocumentsTable --project apps/api
```

## Checklist

- [ ] Entity class in `Data/`
- [ ] EF Core configuration in `Data/`
- [ ] `DbSet` + `ApplyConfiguration` in `AegisDbContext`
- [ ] DTO in `Dtos/`
- [ ] Exception in `Exceptions/` (if needed)
- [ ] Sieve processor in `Services/` (if paginated)
- [ ] Feature folders in `Features/` (Request + Handler + Endpoint + Validator)
- [ ] `{Slice}Configurations.cs` with DI + endpoint mapping
- [ ] Wired in `Program.cs`
- [ ] Migration created
- [ ] Build compiles: `dotnet build`
