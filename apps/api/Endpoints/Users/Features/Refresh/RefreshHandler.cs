using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Users.Features.Refresh;

public sealed class RefreshHandler : IRequestHandler<RefreshRequest, RefreshResponse>
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

    public async Task<RefreshResponse> Handle(RefreshRequest request, CancellationToken ct)
    {
        var existingRefreshToken = await _refreshToken.ValidateRefreshTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == existingRefreshToken.UserId && u.IsActive, ct)
            ?? throw new UnauthorizedAccessException("User not found or inactive.");

        var roles = await _db.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync(ct);

        // Revoke the old refresh token (token rotation)
        await _refreshToken.RevokeRefreshTokenAsync(request.RefreshToken, ct);

        // Generate new tokens
        var newAccessToken = _jwt.GenerateToken(user, roles);
        var newRefreshToken = await _refreshToken.GenerateRefreshTokenAsync(user.Id, ct);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        return new RefreshResponse
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = expiresAt,
        };
    }
}
