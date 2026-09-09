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
            })
            .ToListAsync(ct);

        return annotations;
    }
}
