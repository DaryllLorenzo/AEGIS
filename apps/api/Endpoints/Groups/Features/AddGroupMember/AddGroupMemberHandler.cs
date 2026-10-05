using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.AddGroupMember;

public sealed record AddGroupMemberRequest : IRequest<GroupDto>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
    /// <summary>Defaults to the "Student" role when omitted.</summary>
    public Guid? RoleId { get; init; }
}

public sealed class AddGroupMemberHandler : IRequestHandler<AddGroupMemberRequest, GroupDto>
{
    private readonly AegisDbContext _db;

    public AddGroupMemberHandler(AegisDbContext db) => _db = db;

    public async Task<GroupDto> Handle(AddGroupMemberRequest request, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([request.GroupId], ct)
            ?? throw new GroupNotFoundException(request.GroupId);

        var user = await _db.Users.FindAsync([request.UserId], ct)
            ?? throw new UserNotFoundException(request.UserId);

        var alreadyMember = await _db.UserRoles.AnyAsync(
            ur => ur.UserId == request.UserId && ur.GroupId == request.GroupId, ct);
        if (alreadyMember)
        {
            return group.ToDto();
        }

        var roleId = request.RoleId;
        if (roleId is null)
        {
            var memberRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Student", ct);
            if (memberRole is null)
            {
                throw new InvalidOperationException("Default member role not found.");
            }
            roleId = memberRole.Id;
        }

        _db.UserRoles.Add(new GroupUserRole
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            GroupId = request.GroupId,
            RoleId = roleId.Value,
            AssignedAt = DateTimeOffset.UtcNow,
        });

        group.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        return group.ToDto();
    }
}
