using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Endpoints.Users.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Users.Features.Login;

public sealed class LoginHandler : IRequestHandler<LoginRequest, LoginResponse>
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

    public async Task<LoginResponse> Handle(LoginRequest request, CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct)
            ?? throw new InvalidCredentialsException();

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        var roles = await _db.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync(ct);

        var token = _jwt.GenerateToken(user, roles);
        var expiresAt = DateTime.UtcNow.AddHours(24);
        var refreshToken = await _refreshToken.GenerateRefreshTokenAsync(user.Id, ct);

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken.Token,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ExpiresAt = expiresAt,
        };
    }
}
