namespace Aegis.Api.Modules.Users.Features.Refresh;

public sealed record RefreshResponse
{
    public required string Token { get; init; }
    public required string RefreshToken { get; init; }
    public DateTime ExpiresAt { get; init; }
}
