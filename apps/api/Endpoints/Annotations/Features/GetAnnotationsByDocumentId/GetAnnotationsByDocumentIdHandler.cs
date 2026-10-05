using Aegis.Api.Data;
using Aegis.Api.Endpoints.Annotations.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Annotations.Features.GetAnnotationsByDocumentId;

public sealed class GetAnnotationsByDocumentIdHandler : IRequestHandler<GetAnnotationsByDocumentIdRequest, List<AnnotationDto>>
{
    private readonly AegisDbContext _db;

    public GetAnnotationsByDocumentIdHandler(AegisDbContext db) => _db = db;

    public async Task<List<AnnotationDto>> Handle(GetAnnotationsByDocumentIdRequest request, CancellationToken ct)
    {
        var annotations = await _db.Annotations
            .Where(a => a.DocumentId == request.DocumentId && a.IsActive)
            .OrderBy(a => a.PageNumber)
            .ThenBy(a => a.CreatedAt)
            .ToListAsync(ct);

        // Resolve authors so the UI can show who made each annotation.
        var authorIds = annotations
            .Where(a => a.CreatedByUserId.HasValue)
            .Select(a => a.CreatedByUserId!.Value)
            .Distinct()
            .ToList();

        var authorNames = authorIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _db.Users
                .Where(u => authorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName, ct);

        return annotations
            .Select(a => new AnnotationDto
            {
                Id = a.Id,
                DocumentId = a.DocumentId,
                PageNumber = a.PageNumber,
                Type = a.Type,
                Geometry = a.Geometry,
                Content = a.Content,
                Color = a.Color,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                CreatedByUserId = a.CreatedByUserId,
                AuthorName = a.CreatedByUserId.HasValue && authorNames.TryGetValue(a.CreatedByUserId.Value, out var name)
                    ? name
                    : null,
            })
            .ToList();
    }
}
