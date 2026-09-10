namespace Aegis.Api.Endpoints.Users.Features.Login;

public sealed record LoginResponse
{
    public required string Token { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public DateTime ExpiresAt { get; init; }
}
