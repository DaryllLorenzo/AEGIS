using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Mappings;
using Aegis.Api.Endpoints.Users.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Users.Features.GetUsers;

public sealed class GetUsersHandler : IRequestHandler<GetUsersRequest, PaginatedList<UserDto>>
{
    private readonly AegisDbContext _db;
    private readonly UserSieveProcessor _sieve;

    public GetUsersHandler(AegisDbContext db, UserSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<UserDto>> Handle(GetUsersRequest request, CancellationToken ct)
    {
        var query = _db.Users.AsQueryable();

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(u => u.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<UserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}
