using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroupMembers;

public sealed record GetGroupMembersRequest : IRequest<List<GroupMemberDto>>
{
    public Guid GroupId { get; init; }
}

public sealed class GetGroupMembersHandler : IRequestHandler<GetGroupMembersRequest, List<GroupMemberDto>>
{
    private readonly AegisDbContext _db;

    public GetGroupMembersHandler(AegisDbContext db) => _db = db;

    public async Task<List<GroupMemberDto>> Handle(GetGroupMembersRequest request, CancellationToken ct)
    {
        // One row per (user, role): a member may hold several roles.
        var rows = await _db.UserRoles
            .Where(ur => ur.GroupId == request.GroupId)
            .ToListAsync(ct);

        if (rows.Count == 0) return [];

        var roleNames = await _db.Roles
            .Where(r => rows.Select(ur => ur.RoleId).Distinct().Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => r.Name, ct);

        var users = await _db.Users
            .Where(u => rows.Select(ur => ur.UserId).Distinct().Contains(u.Id))
            .ToListAsync(ct);

        return users
            .OrderBy(u => u.DisplayName)
            .Select(u => new GroupMemberDto
            {
                Id = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
                Roles = rows
                    .Where(ur => ur.UserId == u.Id)
                    .Select(ur => roleNames.GetValueOrDefault(ur.RoleId, "Student"))
                    .ToList(),
            })
            .ToList();
    }
}
