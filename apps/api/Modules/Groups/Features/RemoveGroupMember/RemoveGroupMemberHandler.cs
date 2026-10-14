using Aegis.Api.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Api.Modules.Groups.Mappings;
using Aegis.Api.Modules.Users.Data;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Groups.Features.RemoveGroupMember;

public sealed record RemoveGroupMemberRequest : IRequest<Result<GroupDto>>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
}

public sealed class RemoveGroupMemberHandler : IRequestHandler<RemoveGroupMemberRequest, Result<GroupDto>>
{
    private readonly AegisDbContext _db;

    public RemoveGroupMemberHandler(AegisDbContext db) => _db = db;

    public async Task<Result<GroupDto>> Handle(RemoveGroupMemberRequest request, CancellationToken cancellationToken)
    {
        var group = await _db.Groups.FindAsync([request.GroupId], cancellationToken);

        if (group is null)
        {
            return Error.NotFound("Group.NotFound", $"Group with ID '{request.GroupId}' was not found.");
        }

        var membership = await _db.UserRoles
            .FirstOrDefaultAsync(
                ur => ur.UserId == request.UserId && ur.GroupId == request.GroupId, cancellationToken);

        if (membership is not null)
        {
            _db.UserRoles.Remove(membership);
            group.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return group.ToDto();
    }
}
