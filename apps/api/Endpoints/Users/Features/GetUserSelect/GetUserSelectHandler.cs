using Aegis.Api.Data;
using Aegis.Api.Shared.Select;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Users.Features.GetUserSelect;

public sealed record GetUserSelectRequest : IRequest<List<SelectItemDto>>
{
    /// <summary>When set, only members of this group are returned.</summary>
    public Guid? GroupId { get; init; }

    /// <summary>Optional case-insensitive search over DisplayName and Email.</summary>
    public string? Search { get; init; }
}

public sealed class GetUserSelectHandler : IRequestHandler<GetUserSelectRequest, List<SelectItemDto>>
{
    private const int MaxResults = 25;

    private readonly AegisDbContext _db;

    public GetUserSelectHandler(AegisDbContext db) => _db = db;

    public async Task<List<SelectItemDto>> Handle(GetUserSelectRequest request, CancellationToken ct)
    {
        // Label = DisplayName. In an assignment workflow the reviewer is
        // chosen by the name colleagues know them by (the same value the
        // JWT "Name" claim and every "Assigned to X" surface use); email
        // stays available as the unambiguous fallback on the user record.
        var query = _db.Users.Where(u => u.IsActive).AsQueryable();

        if (request.GroupId.HasValue)
        {
            query = query.Where(u => _db.UserRoles
                .Any(ur => ur.UserId == u.Id && ur.GroupId == request.GroupId.Value));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(u =>
                EF.Functions.ILike(u.DisplayName, $"%{term}%") ||
                EF.Functions.ILike(u.Email, $"%{term}%"));
        }

        return await query
            .OrderBy(u => u.DisplayName)
            .Take(MaxResults)
            .Select(u => new SelectItemDto { Id = u.Id, Label = u.DisplayName })
            .ToListAsync(ct);
    }
}
