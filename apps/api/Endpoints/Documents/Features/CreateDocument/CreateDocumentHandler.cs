using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Mappings;
using Aegis.Api.Shared.Storage;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed class CreateDocumentHandler : IRequestHandler<CreateDocumentRequest, DocumentDto>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;

    private const string BucketName = "aegis-documents";

    public CreateDocumentHandler(AegisDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<DocumentDto> Handle(CreateDocumentRequest request, CancellationToken ct)
    {
        await _storage.EnsureBucketExistsAsync(BucketName, ct);

        var safeFileName = Path.GetFileName(request.FileName);
        var objectKey = $"documents/{DateTimeOffset.UtcNow:yyyyMMddHHmmss}_{safeFileName}";

        var stored = await _storage.UploadAsync(
            bucketName: BucketName,
            objectKey: objectKey,
            stream: request.FileStream,
            fileSize: request.FileSize,
            mimeType: request.ContentType,
            cancellationToken: ct);

        var document = new Document
        {
            Id = Guid.NewGuid(),
            ParentId = request.ParentId,
            TotalPages = request.TotalPages,
            Name = request.Name,
            ObjectKey = objectKey,
            BucketName = BucketName,
            FileSize = stored.FileSize,
            MimeType = request.ContentType,
            Checksum = stored.Checksum ?? string.Empty,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync(ct);

        return document.ToDto();
    }
}
