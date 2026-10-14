using Aegis.Api.Data;
using Aegis.Common.Result;
using Aegis.Storage;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.DeleteDocument;

public sealed class DeleteDocumentHandler : IRequestHandler<DeleteDocumentRequest, Result>
{
    private readonly AegisDbContext _db;
    private readonly IStorageService _storage;

    public DeleteDocumentHandler(AegisDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<Result> Handle(DeleteDocumentRequest request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.FindAsync([request.Id], cancellationToken);

        if (document is null)
        {
            return Error.NotFound("Document.NotFound", $"Document with ID '{request.Id}' was not found.");
        }

        await _storage.DeleteAsync(document.BucketName, document.ObjectKey, cancellationToken);

        _db.Documents.Remove(document);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
