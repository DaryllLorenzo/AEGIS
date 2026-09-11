using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Groups.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroups;

public sealed class GetGroupsHandler : IRequestHandler<GetGroupsRequest, PaginatedList<GroupDto>>
{
    private readonly AegisDbContext _db;
    private readonly GroupSieveProcessor _sieve;

    public GetGroupsHandler(AegisDbContext db, GroupSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<GroupDto>> Handle(GetGroupsRequest request, CancellationToken ct)
    {
        var query = _db.Groups.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(g => g.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<GroupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
