---
name: aegis-backend
description: Use when adding or editing a backend feature, endpoint, EF configuration, or exception in this repo. Follows the existing MediatR vertical-slice conventions in apps/api.
---

# Adding a backend feature (`apps/api`)

## Scaffold checklist

1. Create the feature folder: `Endpoints/<Area>/Features/<Name>/`.
2. Add the four files of the slice:
   - `<Name>Endpoint.cs` — `internal static class <Name>Endpoint` with an
     `internal static RouteHandlerBuilder Map<Name>Endpoint(this IEndpointRouteBuilder)`.
     Routes are relative to the area group (e.g. `/`, `/{id}`, `/select`). Take
     `ISender`, `IValidator<TRequest>`, `CancellationToken`. Map domain exceptions
     here with a `try/catch` → `TypedResults.ValidationProblem(...)`; return
     `TypedResults.Created(...)`/`Ok(...)`/`NoContent()`.
   - `<Name>Request.cs` — `public sealed record <Name>Request : IRequest<<Name>Dto>`.
   - `<Name>Validator.cs` — `AbstractValidator<<Name>Request>` (always include one).
   - `<Name>Handler.cs` — `public sealed class <Name>Handler : IRequestHandler<...>`.
     Domain exceptions live in `Endpoints/<Area>/Exceptions/`.
3. Create/edit the DTO and mapper: `Dtos/<Entity>Dto.cs` + a
   `<Entity>.ToDto()` extension under `Mappings/`.
4. Register the endpoint in `<Area>Configurations.cs` (`Map<Area>Module` is called
   from `Program.cs`). DTOs/exceptions must have no nullable-disabled mismatch —
   keep the file-scoped namespace and usings minimal like the existing slices.
5. Current user: inject `IHttpContextAccessor`, parse `ClaimTypes.NameIdentifier`
   to a `Guid` (mirrors `CreateDocumentHandler`).

## EF configuration

- One `IEntityTypeConfiguration<T>` per entity in `Endpoints/<Area>/Data/<Entity>Configuration.cs`.
  It is discovered automatically by `AegisDbContext`.
- **Always bind the navigation when one exists.** `builder.HasOne<Document>().WithMany()...`
  on an entity that also has `Document? Parent`/`List<Document> Children` silently
  creates a second anonymous relationship and a shadow FK column (`ParentId1`,
  `AssigneeUserId`). Use `builder.HasOne(d => d.Parent).WithMany(d => d.Children).HasForeignKey(d => d.ParentId)`.
- `builder.ToTable("PluralName")` and all column names are case-sensitive/quoted.

## Enums and the wire

Enums over the wire are numeric (`0,1,…`) because there is no global
`JsonStringEnumConverter`. Every enum added on the API needs a matching
client-side normalization in the same area's `apps/web/src/lib/api/<area>.ts`
(`normalizeReviewStatus`, `normalizeDocumentType`) or the UI crashes on
`<number>.toLowerCase()`.

## Verify

`cd apps/api && dotnet build` must pass before any migration work.
