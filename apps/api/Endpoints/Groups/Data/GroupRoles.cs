using Aegis.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Groups.Data;

/// <summary>
/// Canonical role names within a group. Roles are scoped per group:
/// the same user can hold different roles in different groups.
/// </summary>
public static class GroupRoles
{
    /// <summary>The user who created the group. Always present exactly once per creator+group.</summary>
    public const string Creator = "Creator";

    /// <summary>Submits documents for review inside the group.</summary>
    public const string Submitter = "Submitter";

    /// <summary>Reviews documents inside the group.</summary>
    public const string Reviewer = "Reviewer";

    /// <summary>Roles assignable to members. "Creator" is set automatically.</summary>
    public static readonly string[] Assignable = [Submitter, Reviewer];

    /// <summary>
    /// Role names a given user currently holds in a group (rows in UserRoles).
    /// A review's AssigneeId, when set, is the only user allowed to complete it.
    /// </summary>
    public static async Task<List<string>> RolesOfUserAsync(
        AegisDbContext db,
        Guid userId,
        Guid groupId,
        CancellationToken ct)
    {
        return await db.UserRoles
            .Where(ur => ur.UserId == userId && ur.GroupId == groupId)
            .Join(
                db.Roles,
                ur => ur.RoleId,
                r => r.Id,
                (ur, r) => r.Name)
            .ToListAsync(ct);
    }
}

