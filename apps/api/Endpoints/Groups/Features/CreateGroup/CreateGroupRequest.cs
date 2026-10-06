using Aegis.Api.Endpoints.Groups.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

public sealed record CreateGroupRequest : IRequest<GroupDto>
{
    public required string Name { get; init; }
    public Guid FacultyId { get; init; }
    public string? Description { get; init; }
    /// <summary>
    /// The creator's group role. The creator ALSO holds the
    /// implicit "Creator" role for this group, so every creator
    /// keeps exactly one non-Creator (Submitter or Reviewer) role.
    /// Defaults to "Submitter" when omitted.
    /// </summary>
    public string? CreatorRole { get; init; }
    /// <summary>
    /// Members to link at creation. Each entry holds exactly ONE role
    /// in this group ("Submitter" or "Reviewer"). Roles are per-group
    /// — a user can hold different roles in different groups.
    /// </summary>
    public List<GroupMember>? Members { get; init; }
}

public sealed record GroupMember
{
    public Guid UserId { get; init; }
    /// <summary>Roles assigned to this member in this group (validated to Submitter/Reviewer).</summary>
    public List<string> Roles { get; init; } = [];
}
