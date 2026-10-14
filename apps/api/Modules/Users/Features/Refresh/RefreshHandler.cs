using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Services;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Users.Features.Refresh;

public sealed class RefreshHandler : IRequestHandler<RefreshRequest, Result<RefreshResponse>>
{
    private readonly AegisDbContext _db;
    private readonly JwtTokenService _jwt;
    private readonly RefreshTokenService _refreshToken;

    public RefreshHandler(AegisDbContext db, JwtTokenService jwt, RefreshTokenService refreshToken)
    {
        _db = db;
        _jwt = jwt;
        _refreshToken = refreshToken;
    }

    public async Task<Result<RefreshResponse>> Handle(RefreshRequest request, CancellationToken cancellationToken)
    {
        var existingRefreshToken = await _refreshToken.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken);

        if (existingRefreshToken is null)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == existingRefreshToken.UserId && u.IsActive, cancellationToken);

        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "User not found or inactive.");
        }

        var roles = await _db.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync(cancellationToken);

        // Revoke the old refresh token (token rotation)
        await _refreshToken.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);

        // Generate new tokens
        var newAccessToken = _jwt.GenerateToken(user, roles);
        var newRefreshToken = await _refreshToken.GenerateRefreshTokenAsync(user.Id, cancellationToken);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        return new RefreshResponse
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = expiresAt,
        };
    }
}
