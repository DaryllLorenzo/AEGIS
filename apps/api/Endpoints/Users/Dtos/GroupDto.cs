namespace Aegis.Api.Endpoints.Users.Dtos;

public sealed record GroupDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid FacultyId { get; init; }
    public string? Description { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
