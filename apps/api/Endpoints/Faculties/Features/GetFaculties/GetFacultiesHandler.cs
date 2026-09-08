using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Mappings;
using Aegis.Api.Endpoints.Faculties.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFaculties;

public sealed class GetFacultiesHandler : IRequestHandler<GetFacultiesRequest, PaginatedList<FacultyDto>>
{
    private readonly AegisDbContext _db;
    private readonly FacultySieveProcessor _sieve;

    public GetFacultiesHandler(AegisDbContext db, FacultySieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<FacultyDto>> Handle(GetFacultiesRequest request, CancellationToken ct)
    {
        var query = _db.Faculties.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(f => f.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<FacultyDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
