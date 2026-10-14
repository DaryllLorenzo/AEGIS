using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using Aegis.Api.Endpoints.Documents.Mappings;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Storage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Documents.Features.UpdateDocument;

public sealed class UpdateDocumentHandler : IRequestHandler<UpdateDocumentRequest, DocumentDto>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;

    public UpdateDocumentHandler(AegisDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<DocumentDto> Handle(UpdateDocumentRequest request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.FindAsync([request.Id], cancellationToken)
            ?? throw new DocumentNotFoundException(request.Id);

        var hasCompletedReview = await _db.Reviews.AnyAsync(
            r => r.DocumentId == document.Id && r.Status == ReviewStatus.Completed, cancellationToken);

        if (hasCompletedReview)
        {
            throw new DocumentLockedException(request.Id);
        }

        document.Name = request.Name;

        if (request.ParentId.HasValue)
        {
            document.ParentId = request.ParentId;
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
}
