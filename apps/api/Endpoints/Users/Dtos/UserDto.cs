namespace Aegis.Api.Endpoints.Users.Dtos;

public sealed record UserDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
