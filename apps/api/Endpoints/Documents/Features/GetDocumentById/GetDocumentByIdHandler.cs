using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using Aegis.Api.Endpoints.Documents.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

public sealed class GetDocumentByIdHandler : IRequestHandler<GetDocumentByIdRequest, DocumentDto>
{
    private readonly AegisDbContext _db;

    public GetDocumentByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<DocumentDto> Handle(GetDocumentByIdRequest request, CancellationToken ct)
    {
        var document = await _db.Documents.FindAsync([request.Id], ct)
            ?? throw new DocumentNotFoundException(request.Id);

        return document.ToDto();
    }
}
