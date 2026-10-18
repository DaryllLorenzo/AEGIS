using Aegis.Api.Common.Authz;
using Aegis.Api.Data;
using Aegis.Api.Modules.Annotations.Data;
using Aegis.Api.Modules.Annotations.Dtos;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Annotations.Features.BulkUpdateAnnotations;

public sealed class BulkUpdateAnnotationsHandler
    : IRequestHandler<BulkUpdateAnnotationsRequest, Result<List<AnnotationDto>>>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BulkUpdateAnnotationsHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<List<AnnotationDto>>> Handle(
        BulkUpdateAnnotationsRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = _httpContextAccessor.HttpContext?.User.GetUserId();

        // Annotations are editable only while the document's active
        // (most recent) review round is in progress: read-only before
        // "Start Review" and after "Complete Review".
        var latestReview = await _db.Reviews
            .Where(r => r.DocumentId == request.DocumentId)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestReview is null || latestReview.Status != ReviewStatus.InProgress)
        {
            return Error.Validation(
                "documentId",
                $"Annotations for document '{request.DocumentId}' can only be edited while a review of that document is in progress.");
        }

        // Only Reviewers in the document's group may write annotations
        // (Submitters and creator-submitters are read-only).
        var document = await _db.Documents.FindAsync([request.DocumentId], cancellationToken);

        if (document is null)
        {
            return Error.Validation(
                "documentId",
                $"Annotations for document '{request.DocumentId}' can only be edited while a review of that document is in progress.");
        }

        var myRoles = currentUserId.HasValue
            ? await GroupRoles.RolesOfUserAsync(_db, currentUserId.Value, document.GroupId, cancellationToken)
            : [];

        if (!currentUserId.HasValue || !myRoles.Contains(GroupRoles.Reviewer))
        {
            return Error.Forbidden(
                "Annotations.Permission",
                $"Only Reviewers in this group can edit annotations for document '{request.DocumentId}'.");
        }

        var existing = await _db.Annotations
            .Where(a => a.DocumentId == request.DocumentId)
            .ToListAsync(cancellationToken);

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
        await _db.SaveChangesAsync(cancellationToken);

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
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName, cancellationToken);

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
