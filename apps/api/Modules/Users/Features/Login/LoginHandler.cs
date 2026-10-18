using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Services;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Users.Features.Login;

public sealed class LoginHandler : IRequestHandler<LoginRequest, Result<LoginResponse>>
{
    private readonly AegisDbContext _db;
    private readonly JwtTokenService _jwt;
    private readonly RefreshTokenService _refreshToken;

    public LoginHandler(AegisDbContext db, JwtTokenService jwt, RefreshTokenService refreshToken)
    {
        _db = db;
        _jwt = jwt;
        _refreshToken = refreshToken;
    }

    public async Task<Result<LoginResponse>> Handle(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, cancellationToken);

        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");
        }

        var roles = await _db.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync(cancellationToken);

        var token = _jwt.GenerateToken(user, roles);
        var expiresAt = DateTime.UtcNow.Add(_jwt.AccessTokenLifetime);
        var (_, refreshToken) = await _refreshToken.GenerateRefreshTokenAsync(user.Id, cancellationToken);

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ExpiresAt = expiresAt,
        };
    }
}
