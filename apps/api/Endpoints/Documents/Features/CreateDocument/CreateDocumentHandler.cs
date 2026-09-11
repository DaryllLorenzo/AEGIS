using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using Aegis.Api.Endpoints.Documents.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Shared.Storage;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PdfSharp.Pdf.IO;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed class CreateDocumentHandler : IRequestHandler<CreateDocumentRequest, DocumentDto>
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

    public async Task<DocumentDto> Handle(CreateDocumentRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var isMember = await _db.UserRoles.AnyAsync(
            ur => ur.UserId == userId && ur.GroupId == request.GroupId, ct);

        if (!isMember)
        {
            throw new NotGroupMemberException(request.GroupId);
        }

        await _storage.EnsureBucketExistsAsync(BucketName, ct);

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
                await request.FileStream.CopyToAsync(pdfMemoryStream, ct);
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
            cancellationToken: ct);

        pdfMemoryStream?.Dispose();
        request.FileStream?.Dispose();

        var document = new Document
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            ParentId = request.ParentId,
            TotalPages = totalPages,
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
