using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Annotations.Data;
using Aegis.Api.Endpoints.Annotations.Dtos;
using Aegis.Api.Endpoints.Annotations.Exceptions;
using Aegis.Api.Endpoints.Reviews.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;

public sealed class BulkUpdateAnnotationsHandler : IRequestHandler<BulkUpdateAnnotationsRequest, List<AnnotationDto>>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BulkUpdateAnnotationsHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<AnnotationDto>> Handle(BulkUpdateAnnotationsRequest request, CancellationToken ct)
    {
        Guid? currentUserId = null;
        if (_httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier) is { } parsed
            && Guid.TryParse(parsed, out var parsedGuid))
        {
            currentUserId = parsedGuid;
        }

        // Annotations are editable only while the document's active
        // (most recent) review round is in progress: read-only before
        // "Start Review" and after "Complete Review".
        var latestReview = await _db.Reviews
            .Where(r => r.DocumentId == request.DocumentId)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (latestReview is null || latestReview.Status != ReviewStatus.InProgress)
        {
            throw new AnnotationsLockedException(request.DocumentId);
        }

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
                // Author is preserved — editing content must not reassign ownership.
                if (found.CreatedByUserId is null && currentUserId.HasValue)
                {
                    found.CreatedByUserId = currentUserId;
                }
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
                    CreatedByUserId = currentUserId,
                };
                toCreate.Add(annotation);
            }
        }

        _db.Annotations.AddRange(toCreate);
        await _db.SaveChangesAsync(ct);

        var resultAnnotations = toUpdate.Concat(toCreate).ToList();

        var resultAuthorIds = resultAnnotations
            .Where(a => a.CreatedByUserId.HasValue)
            .Select(a => a.CreatedByUserId!.Value)
            .Distinct()
            .ToList();

        var resultAuthorNames = resultAuthorIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _db.Users
                .Where(u => resultAuthorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName, ct);

        var result = resultAnnotations.Select(a => new AnnotationDto
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
            AuthorName = a.CreatedByUserId.HasValue && resultAuthorNames.TryGetValue(a.CreatedByUserId.Value, out var name)
                ? name
                : null,
        }).ToList();

        return result;
    }
}
