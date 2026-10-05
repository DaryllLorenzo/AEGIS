using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.RemoveGroupMember;

public sealed record RemoveGroupMemberRequest : IRequest<GroupDto>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
}

public sealed class RemoveGroupMemberHandler : IRequestHandler<RemoveGroupMemberRequest, GroupDto>
{
    private readonly AegisDbContext _db;

    public RemoveGroupMemberHandler(AegisDbContext db) => _db = db;

    public async Task<GroupDto> Handle(RemoveGroupMemberRequest request, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([request.GroupId], ct)
            ?? throw new GroupNotFoundException(request.GroupId);

        var membership = await _db.UserRoles
            .FirstOrDefaultAsync(
                ur => ur.UserId == request.UserId && ur.GroupId == request.GroupId, ct);

        if (membership is not null)
        {
            _db.UserRoles.Remove(membership);
            group.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);
        }

        return group.ToDto();
    }
}
