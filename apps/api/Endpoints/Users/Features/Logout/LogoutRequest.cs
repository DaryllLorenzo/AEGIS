using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.Logout;

public sealed record LogoutRequest : IRequest<LogoutResponse>
{
    public required string RefreshToken { get; init; }
}
