using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Api.Modules.Documents.Mappings;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Common.Result;
using Aegis.Storage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Documents.Features.UpdateDocument;

public sealed class UpdateDocumentHandler : IRequestHandler<UpdateDocumentRequest, Result<DocumentDto>>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;

    public UpdateDocumentHandler(AegisDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<Result<DocumentDto>> Handle(UpdateDocumentRequest request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.FindAsync([request.Id], cancellationToken);

        if (document is null)
        {
            return Error.NotFound("Document.NotFound", $"Document with ID '{request.Id}' was not found.");
        }

        var hasCompletedReview = await _db.Reviews.AnyAsync(
            r => r.DocumentId == document.Id && r.Status == ReviewStatus.Completed, cancellationToken);

        if (hasCompletedReview)
        {
            return Error.Validation(
                "document",
                "This document has a completed review and cannot be modified.");
        }

        document.Name = request.Name;

        // Re-parenting is only allowed to a document in the same group that is not the
        // document itself nor one of its descendants (which would create a cycle).
        // A new parent also restarts the lineage version at parent.Version + 1.
        if (request.ParentId.HasValue && request.ParentId != document.ParentId)
        {
            var parent = await _db.Documents.FindAsync([request.ParentId.Value], cancellationToken);

            if (parent is null || parent.GroupId != document.GroupId)
            {
                return Error.Validation(
                    "parentId",
                    $"Parent document '{request.ParentId.Value}' was not found in this group.");
            }

            if (parent.Id == document.Id || await IsDescendantOfAsync(parent, document.Id, cancellationToken))
            {
                return Error.Validation("parentId", "A document cannot be its own ancestor.");
            }

            document.ParentId = parent.Id;
            document.Version = parent.Version + 1;
        }

        if (request.TotalPages.HasValue)
        {
            document.TotalPages = request.TotalPages.Value;
        }

        if (request.FileStream is not null)
        {
            await _storage.DeleteAsync(document.BucketName, document.ObjectKey, cancellationToken);

            var safeFileName = Path.GetFileName(request.FileName!);
            var objectKey = $"documents/{DateTimeOffset.UtcNow:yyyyMMddHHmmss}_{safeFileName}";

            var stored = await _storage.UploadAsync(
                bucketName: document.BucketName,
                objectKey: objectKey,
                stream: request.FileStream,
                fileSize: request.FileSize!.Value,
                mimeType: request.ContentType!,
                cancellationToken: cancellationToken);

            document.ObjectKey = objectKey;
            document.FileSize = stored.FileSize;
            document.MimeType = request.ContentType!;
            document.Checksum = stored.Checksum ?? string.Empty;
        }

        document.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return document.ToDto();
    }

    // Walks up the parent chain from candidate, looking for ancestorId.
    private async Task<bool> IsDescendantOfAsync(Document candidate, Guid ancestorId, CancellationToken ct)
    {
        var current = candidate;

        while (current.ParentId.HasValue)
        {
            if (current.ParentId.Value == ancestorId)
            {
                return true;
            }

            var next = await _db.Documents.FindAsync([current.ParentId.Value], ct);

            if (next is null)
            {
                break;
            }

            current = next;
        }

        return false;
    }
}
