using Aegis.Api.Modules.Users.Services;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.Logout;

public sealed class LogoutHandler : IRequestHandler<LogoutRequest, LogoutResponse>
{
    private readonly RefreshTokenService _refreshToken;

    public LogoutHandler(RefreshTokenService refreshToken)
    {
        _refreshToken = refreshToken;
    }

    public async Task<LogoutResponse> Handle(LogoutRequest request, CancellationToken cancellationToken)
    {
        await _refreshToken.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);
        return new LogoutResponse { Success = true };
    }
}
