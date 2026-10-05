using System.Security.Claims;
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
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetGroupsHandler(
        AegisDbContext db,
        GroupSieveProcessor sieve,
        IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _sieve = sieve;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PaginatedList<GroupDto>> Handle(GetGroupsRequest request, CancellationToken ct)
    {
        var query = _db.Groups.AsQueryable();

        // "My groups": restrict to groups the current user is a member of.
        if (request.Mine == true
            && _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier) is { } parsed
            && Guid.TryParse(parsed, out var userId))
        {
            query = query.Where(g => _db.UserRoles
                .Any(ur => ur.GroupId == g.Id && ur.UserId == userId));
        }

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
