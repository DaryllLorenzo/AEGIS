using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Api.Modules.Documents.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.GetDocumentById;

public sealed class GetDocumentByIdHandler : IRequestHandler<GetDocumentByIdRequest, Result<DocumentDto>>
{
    private readonly AegisDbContext _db;

    public GetDocumentByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result<DocumentDto>> Handle(GetDocumentByIdRequest request, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.FindAsync([request.Id], cancellationToken);

        if (document is null)
        {
            return Error.NotFound("Document.NotFound", $"Document with ID '{request.Id}' was not found.");
        }

        return document.ToDto();
    }
}
