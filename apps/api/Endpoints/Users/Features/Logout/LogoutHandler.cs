using Aegis.Api.Endpoints.Users.Services;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.Logout;

public sealed class LogoutHandler : IRequestHandler<LogoutRequest, LogoutResponse>
{
    private readonly RefreshTokenService _refreshToken;

    public LogoutHandler(RefreshTokenService refreshToken)
    {
        _refreshToken = refreshToken;
    }

    public async Task<LogoutResponse> Handle(LogoutRequest request, CancellationToken ct)
    {
        await _refreshToken.RevokeRefreshTokenAsync(request.RefreshToken, ct);
        return new LogoutResponse { Success = true };
    }
}
