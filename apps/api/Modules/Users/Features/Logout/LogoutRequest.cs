using MediatR;

namespace Aegis.Api.Modules.Users.Features.Logout;

public sealed record LogoutRequest : IRequest<LogoutResponse>
{
    public required string RefreshToken { get; init; }
}
