using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Api.Modules.Documents.Mappings;
using Aegis.Api.Modules.Users.Data;
using Aegis.Common.Result;
using Aegis.Storage;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PdfSharp.Pdf.IO;

namespace Aegis.Api.Modules.Documents.Features.CreateDocument;

public sealed class CreateDocumentHandler : IRequestHandler<CreateDocumentRequest, Result<DocumentDto>>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;
    private readonly IHttpContextAccessor _httpContextAccessor;

    private const string BucketName = "aegis-documents";

    public CreateDocumentHandler(AegisDbContext db, IStorageService storage, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _storage = storage;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<DocumentDto>> Handle(CreateDocumentRequest request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var isMember = await _db.UserRoles.AnyAsync(
            ur => ur.UserId == userId && ur.GroupId == request.GroupId, cancellationToken);

        if (!isMember)
        {
            return Error.Validation("groupId", "You are not a member of the selected group.");
        }

        // A new version inherits everything from its parent: the exact
        // name, the document type, and the next consecutive version
        // number. Only the file (and the version) changes.
        string name = request.Name;
        DocumentType type = request.Type;
        int version = 1;

        if (request.ParentId.HasValue)
        {
            var parent = await _db.Documents.FindAsync([request.ParentId.Value], cancellationToken);

            if (parent is null || parent.GroupId != request.GroupId)
            {
                return Error.Validation(
                    "parentId",
                    $"Parent document '{request.ParentId.Value}' was not found in this group.");
            }

            name = parent.Name;
            type = parent.Type;
            version = parent.Version + 1;
        }

        await _storage.EnsureBucketExistsAsync(BucketName, cancellationToken);

        var safeFileName = Path.GetFileName(request.FileName);
        var objectKey = $"documents/{DateTimeOffset.UtcNow:yyyyMMddHHmmss}_{safeFileName}";

        int totalPages = request.TotalPages ?? 0;
        Stream uploadStream = request.FileStream;
        MemoryStream? pdfMemoryStream = null;

        if (totalPages == 0 && request.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                pdfMemoryStream = new MemoryStream();
                await request.FileStream.CopyToAsync(pdfMemoryStream, cancellationToken);
                pdfMemoryStream.Position = 0;

                var pdfDocument = PdfReader.Open(pdfMemoryStream);
                totalPages = pdfDocument.PageCount;

                pdfMemoryStream.Position = 0;
                uploadStream = pdfMemoryStream;
            }
            catch
            {
                totalPages = 1;
                pdfMemoryStream?.Dispose();
                pdfMemoryStream = null;
            }
        }

        var stored = await _storage.UploadAsync(
            bucketName: BucketName,
            objectKey: objectKey,
            stream: uploadStream,
            fileSize: request.FileSize,
            mimeType: request.ContentType,
            cancellationToken: cancellationToken);

        pdfMemoryStream?.Dispose();
        request.FileStream?.Dispose();

        var document = new Document
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            ParentId = request.ParentId,
            TotalPages = totalPages,
            Name = name,
            Type = type,
            Version = version,
            ObjectKey = objectKey,
            BucketName = BucketName,
            FileSize = stored.FileSize,
            MimeType = request.ContentType,
            Checksum = stored.Checksum ?? string.Empty,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync(cancellationToken);

        return document.ToDto();
    }
}
