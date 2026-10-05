using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroupMembers;

public sealed record GetGroupMembersRequest : IRequest<List<UserDto>>
{
    public Guid GroupId { get; init; }
}

public sealed class GetGroupMembersHandler : IRequestHandler<GetGroupMembersRequest, List<UserDto>>
{
    private readonly AegisDbContext _db;

    public GetGroupMembersHandler(AegisDbContext db) => _db = db;

    public async Task<List<UserDto>> Handle(GetGroupMembersRequest request, CancellationToken ct)
    {
        return await _db.UserRoles
            .Where(ur => ur.GroupId == request.GroupId)
            .Join(
                _db.Users,
                ur => ur.UserId,
                u => u.Id,
                (ur, u) => u)
            .OrderBy(u => u.DisplayName)
            .Select(u => u.ToDto())
            .ToListAsync(ct);
    }
}
