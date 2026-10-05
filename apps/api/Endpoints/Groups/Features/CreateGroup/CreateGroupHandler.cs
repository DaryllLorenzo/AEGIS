using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

public sealed class CreateGroupHandler : IRequestHandler<CreateGroupRequest, GroupDto>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateGroupHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GroupDto> Handle(CreateGroupRequest request, CancellationToken ct)
    {
        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            FacultyId = request.FacultyId,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Groups.Add(group);

        // The creator is always a member of their own group —
        // without this, uploads and review creation right after
        // group creation would be rejected.
        var now = DateTimeOffset.UtcNow;
        var memberRole = await _db.Roles
            .FirstOrDefaultAsync(r => r.Name == "Student", ct);

        if (_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) is { } creatorId
            && Guid.TryParse(creatorId, out var creatorGuid))
        {
            if (memberRole is not null)
            {
                _db.UserRoles.Add(new GroupUserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = creatorGuid,
                    GroupId = group.Id,
                    RoleId = memberRole.Id,
                    AssignedAt = now,
                });
            }
        }

        // Link the requested users to the group with the default
        // member role so they can be assigned to reviews immediately.
        if (request.UserIds is { Length: > 0 } && memberRole is not null)
        {
            var creatorGuidParsed = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier) is { } parsed &&
                Guid.TryParse(parsed, out var c) ? c : (Guid?)null;

            foreach (var userId in request.UserIds.Distinct())
            {
                if (userId == creatorGuidParsed) continue;

                _db.UserRoles.Add(new GroupUserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    GroupId = group.Id,
                    RoleId = memberRole.Id,
                    AssignedAt = now,
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        return group.ToDto();
    }
}
