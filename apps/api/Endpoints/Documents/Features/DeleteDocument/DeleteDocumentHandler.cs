using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Exceptions;
using Aegis.Api.Shared.Storage;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.DeleteDocument;

public sealed class DeleteDocumentHandler : IRequestHandler<DeleteDocumentRequest, Unit>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;

    public DeleteDocumentHandler(AegisDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<Unit> Handle(DeleteDocumentRequest request, CancellationToken ct)
    {
        var document = await _db.Documents.FindAsync([request.Id], ct)
            ?? throw new DocumentNotFoundException(request.Id);

        await _storage.DeleteAsync(document.BucketName, document.ObjectKey, ct);

        _db.Documents.Remove(document);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
