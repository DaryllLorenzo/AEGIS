using Aegis.Api.Data;
using Aegis.Api.Endpoints.Annotations.Data;
using Aegis.Api.Endpoints.Annotations.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;

public sealed class BulkUpdateAnnotationsHandler : IRequestHandler<BulkUpdateAnnotationsRequest, List<AnnotationDto>>
{
    private readonly AegisDbContext _db;

    public BulkUpdateAnnotationsHandler(AegisDbContext db) => _db = db;

    public async Task<List<AnnotationDto>> Handle(BulkUpdateAnnotationsRequest request, CancellationToken ct)
    {
        var existing = await _db.Annotations
            .Where(a => a.DocumentId == request.DocumentId)
            .ToListAsync(ct);

        var incomingIds = request.Annotations
            .Where(a => a.Id.HasValue)
            .Select(a => a.Id!.Value)
            .ToHashSet();

        var toDelete = existing
            .Where(e => !incomingIds.Contains(e.Id))
            .ToList();

        _db.Annotations.RemoveRange(toDelete);

        var now = DateTimeOffset.UtcNow;

        var existingDict = existing.ToDictionary(e => e.Id);

        var toUpdate = new List<Annotation>();
        var toCreate = new List<Annotation>();

        foreach (var item in request.Annotations)
        {
            var geometryJson = item.Geometry.ToString();

            if (item.Id.HasValue && existingDict.TryGetValue(item.Id.Value, out var found))
            {
                found.PageNumber = item.PageNumber;
                found.Type = item.Type;
                found.Geometry = geometryJson;
                found.Content = item.Content;
                found.Color = item.Color;
                found.UpdatedAt = now;
                toUpdate.Add(found);
            }
            else
            {
                var annotation = new Annotation
                {
                    Id = item.Id ?? Guid.NewGuid(),
                    DocumentId = request.DocumentId,
                    PageNumber = item.PageNumber,
                    Type = item.Type,
                    Geometry = geometryJson,
                    Content = item.Content,
                    Color = item.Color,
                    IsActive = true,
                    CreatedAt = now,
                };
                toCreate.Add(annotation);
            }
        }

        _db.Annotations.AddRange(toCreate);
        await _db.SaveChangesAsync(ct);

        var result = toUpdate.Concat(toCreate).Select(a => new AnnotationDto
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
        }).ToList();

        return result;
    }
}
