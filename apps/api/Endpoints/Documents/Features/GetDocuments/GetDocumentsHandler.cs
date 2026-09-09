using Aegis.Api.Data;
using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Mappings;
using Aegis.Api.Endpoints.Documents.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

public sealed class GetDocumentsHandler : IRequestHandler<GetDocumentsRequest, PaginatedList<DocumentDto>>
{
    private readonly AegisDbContext _db;
    private readonly DocumentSieveProcessor _sieve;

    public GetDocumentsHandler(AegisDbContext db, DocumentSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<DocumentDto>> Handle(GetDocumentsRequest request, CancellationToken ct)
    {
        var query = _db.Documents.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(d => d.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<DocumentDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
