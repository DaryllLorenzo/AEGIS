using Aegis.Api.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Api.Modules.Groups.Mappings;
using Aegis.Api.Modules.Users.Data;
using Aegis.Common.Result;
using Aegis.Email;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Groups.Features.AddGroupMember;

public sealed class AddGroupMemberHandler : IRequestHandler<AddGroupMemberRequest, Result<GroupDto>>
{
    private readonly AegisDbContext _db;
    private readonly IEmailSender _emailSender;

    public AddGroupMemberHandler(AegisDbContext db, IEmailSender emailSender)
    {
        _db = db;
        _emailSender = emailSender;
    }

    public async Task<Result<GroupDto>> Handle(AddGroupMemberRequest request, CancellationToken cancellationToken)
    {
        var group = await _db.Groups.FindAsync([request.GroupId], cancellationToken);

        if (group is null)
        {
            return Error.NotFound("Group.NotFound", $"Group with ID '{request.GroupId}' was not found.");
        }

        var user = await _db.Users.FindAsync([request.UserId], cancellationToken);

        if (user is null)
        {
            return Error.NotFound("User.NotFound", $"User with ID '{request.UserId}' was not found.");
        }

        var alreadyMember = await _db.UserRoles.AnyAsync(
            ur => ur.UserId == request.UserId && ur.GroupId == request.GroupId, cancellationToken);
        if (alreadyMember)
        {
            return group.ToDto();
        }

        var roleName = string.IsNullOrWhiteSpace(request.Role) ? GroupRoles.Submitter : request.Role;
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken)
            ?? throw new InvalidOperationException($"Role '{roleName}' not found.");

        _db.UserRoles.Add(new GroupUserRole
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            GroupId = request.GroupId,
            RoleId = role.Id,
            AssignedAt = DateTimeOffset.UtcNow,
        });

        group.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        // Best-effort welcome email: the membership already saved, so
        // a mail failure must never break the request.
        try
        {
            await _emailSender.SendAsync(new EmailMessage(
                user.Email,
                $"You were added to the group \"{group.Name}\"",
                $"Hello {user.DisplayName}, you were added to the group \"{group.Name}\" on AEGIS with the role {roleName}."), cancellationToken);
        }
        catch
        {
            // Logged by the sender; group notification is non-fatal.
        }

        return group.ToDto();
    }
}
