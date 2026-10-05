using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Shared.Email;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

public sealed class CreateGroupHandler : IRequestHandler<CreateGroupRequest, GroupDto>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IEmailSender _emailSender;

    public CreateGroupHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _emailSender = emailSender;
    }

    public async Task<GroupDto> Handle(CreateGroupRequest request, CancellationToken ct)
    {
        Guid? creatorId = null;
        if (_httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier) is { } parsed
            && Guid.TryParse(parsed, out var parsedGuid))
        {
            creatorId = parsedGuid;
        }

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            FacultyId = request.FacultyId,
            Description = request.Description,
            CreatedByUserId = creatorId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Groups.Add(group);

        var now = DateTimeOffset.UtcNow;
        var roles = await _db.Roles.ToDictionaryAsync(r => r.Name, r => r.Id, ct);

        // The creator always belongs to their own group with the
        // "Creator" role. They may also hold Submitter/Reviewer
        // rows if they add themselves to the member list.
        if (creatorId is not null && roles.TryGetValue(GroupRoles.Creator, out var creatorRoleId))
        {
            _db.UserRoles.Add(new GroupUserRole
            {
                Id = Guid.NewGuid(),
                UserId = creatorId.Value,
                GroupId = group.Id,
                RoleId = creatorRoleId,
                AssignedAt = now,
            });
        }

        // Link the requested members with their per-group roles.
        if (request.Members is { Count: > 0 })
        {
            foreach (var member in request.Members)
            {
                foreach (var roleName in member.Roles.Distinct())
                {
                    if (roles.TryGetValue(roleName, out var roleId))
                    {
                        _db.UserRoles.Add(new GroupUserRole
                        {
                            Id = Guid.NewGuid(),
                            UserId = member.UserId,
                            GroupId = group.Id,
                            RoleId = roleId,
                            AssignedAt = now,
                        });
                    }
                }
            }
        }

        await _db.SaveChangesAsync(ct);

        // Welcome email to every member linked at creation. The
        // group is already saved, so mail failures are logged
        // and swallowed by the sender.
        if (request.Members is { Count: > 0 })
        {
            var memberIds = request.Members.Select(m => m.UserId).Distinct().ToList();
            var memberUsers = await _db.Users
                .Where(u => memberIds.Contains(u.Id))
                .ToListAsync(ct);

            foreach (var memberUser in memberUsers)
            {
                var member = request.Members.First(m => m.UserId == memberUser.Id);
                var roleLabel = member.Roles.Count > 0
                    ? string.Join(" and ", member.Roles)
                    : "member";

                try
                {
                    await _emailSender.SendAsync(new EmailMessage(
                        memberUser.Email,
                        $"You were added to the group \"{group.Name}\"",
                        $"Hello {memberUser.DisplayName}, you were added to the group \"{group.Name}\" on AEGIS with the role(s): {roleLabel}."), ct);
                }
                catch
                {
                    // Non-fatal: membership already persisted.
                }
            }
        }

        return group.ToDto();
    }
}
