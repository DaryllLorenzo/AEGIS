namespace Aegis.Api.Endpoints.Groups.Dtos;

/// <summary>A user linked to a group, with the roles they hold in THIS group.</summary>
public sealed record GroupMemberDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
    /// <summary>Role names in this group, e.g. ["Creator"], ["Submitter", "Reviewer"].</summary>
    public required List<string> Roles { get; init; }
}
