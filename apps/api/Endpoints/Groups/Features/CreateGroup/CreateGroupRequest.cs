using Aegis.Api.Endpoints.Groups.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

public sealed record CreateGroupRequest : IRequest<GroupDto>
{
    public required string Name { get; init; }
    public Guid FacultyId { get; init; }
    public string? Description { get; init; }
    /// <summary>
    /// Members to link at creation. Each entry lists the roles the
    /// user gets in THIS group ("Submitter" and/or "Reviewer").
    /// Roles are per-group — a user can hold different roles in
    /// different groups.
    /// </summary>
    public List<GroupMember>? Members { get; init; }
}

public sealed record GroupMember
{
    public Guid UserId { get; init; }
    public List<string> Roles { get; init; } = [];
}
