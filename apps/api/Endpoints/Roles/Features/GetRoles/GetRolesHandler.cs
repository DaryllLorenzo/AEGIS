using Aegis.Api.Data;
using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Endpoints.Roles.Mappings;
using Aegis.Api.Endpoints.Roles.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoles;

public sealed class GetRolesHandler : IRequestHandler<GetRolesRequest, PaginatedList<RoleDto>>
{
    private readonly AegisDbContext _db;
    private readonly RoleSieveProcessor _sieve;

    public GetRolesHandler(AegisDbContext db, RoleSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<RoleDto>> Handle(GetRolesRequest request, CancellationToken ct)
    {
        var query = _db.Roles.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(r => r.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<RoleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
