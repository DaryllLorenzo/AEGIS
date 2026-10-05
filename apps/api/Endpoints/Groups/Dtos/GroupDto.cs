namespace Aegis.Api.Endpoints.Groups.Dtos;

public sealed record GroupDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid FacultyId { get; init; }
    public string? Description { get; init; }
    /// <summary>User who created the group (holds the Creator role). Null on legacy rows.</summary>
    public Guid? CreatedByUserId { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
