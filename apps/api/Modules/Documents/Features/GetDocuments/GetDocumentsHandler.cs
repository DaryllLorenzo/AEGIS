using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Api.Modules.Documents.Mappings;
using Aegis.Api.Modules.Documents.Services;
using Aegis.Common.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Documents.Features.GetDocuments;

public sealed class GetDocumentsHandler : IRequestHandler<GetDocumentsRequest, PaginatedList<DocumentDto>>
{
    private readonly AegisDbContext _db;
    private readonly DocumentSieveProcessor _sieve;

    public GetDocumentsHandler(AegisDbContext db, DocumentSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<DocumentDto>> Handle(GetDocumentsRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Documents.AsQueryable();

        if (request.GroupId.HasValue)
        {
            query = query.Where(d => d.GroupId == request.GroupId.Value);
        }

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(cancellationToken);

        var items = await paged
            .Select(d => d.ToDto())
            .ToListAsync(cancellationToken);

        return new PaginatedList<DocumentDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
