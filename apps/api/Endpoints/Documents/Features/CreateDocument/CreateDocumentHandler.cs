using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Mappings;
using Aegis.Api.Shared.Storage;
using MediatR;
using PdfSharp.Pdf.IO;

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

        // Calculate total pages from PDF if not provided
        int totalPages = request.TotalPages ?? 0;
        Stream uploadStream = request.FileStream;
        MemoryStream? pdfMemoryStream = null;

        if (totalPages == 0 && request.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                // Copy stream to memory since PdfSharp needs to seek
                pdfMemoryStream = new MemoryStream();
                await request.FileStream.CopyToAsync(pdfMemoryStream, ct);
                pdfMemoryStream.Position = 0;

                var pdfDocument = PdfReader.Open(pdfMemoryStream);
                totalPages = pdfDocument.PageCount;

                // Use the memory stream for upload
                pdfMemoryStream.Position = 0;
                uploadStream = pdfMemoryStream;
            }
            catch
            {
                // If PDF parsing fails, default to 1
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

        // Dispose the memory stream if we created it
        pdfMemoryStream?.Dispose();

        request.FileStream?.Dispose();

        var document = new Document
        {
            Id = Guid.NewGuid(),
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
