using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Shared.Email;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.AddGroupMember;

public sealed record AddGroupMemberRequest : IRequest<GroupDto>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
    /// <summary>"Submitter" or "Reviewer". Defaults to "Submitter" when omitted.</summary>
    public string? Role { get; init; }
}

public sealed class AddGroupMemberHandler : IRequestHandler<AddGroupMemberRequest, GroupDto>
{
    private readonly AegisDbContext _db;
    private readonly IEmailSender _emailSender;

    public AddGroupMemberHandler(AegisDbContext db, IEmailSender emailSender)
    {
        _db = db;
        _emailSender = emailSender;
    }

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

        var roleName = string.IsNullOrWhiteSpace(request.Role) ? GroupRoles.Submitter : request.Role;
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName, ct)
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
        await _db.SaveChangesAsync(ct);

        // Best-effort welcome email: the membership already saved, so
        // a mail failure must never break the request.
        try
        {
            await _emailSender.SendAsync(new EmailMessage(
                user.Email,
                $"You were added to the group \"{group.Name}\"",
                $"Hello {user.DisplayName}, you were added to the group \"{group.Name}\" on AEGIS with the role {roleName}."), ct);
        }
        catch
        {
            // Logged by the sender; group notification is non-fatal.
        }

        return group.ToDto();
    }
}
