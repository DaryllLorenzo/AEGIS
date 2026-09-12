using System.Security.Cryptography;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Users.Services;

public sealed class RefreshTokenService
{
    private readonly AegisDbContext _db;
    private readonly IConfiguration _configuration;

    public RefreshTokenService(AegisDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = GenerateRandomToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(
                double.Parse(_configuration["Jwt:RefreshExpiresInDays"] ?? "7")),
            IsRevoked = false,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(ct);

        return refreshToken;
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked, ct);

        if (refreshToken is null || refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        return refreshToken;
    }

    public async Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token, ct);

        if (refreshToken is not null)
        {
            refreshToken.IsRevoked = true;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task RevokeAllUserRefreshTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var tokens = await _db.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync(ct);

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task CleanupExpiredTokensAsync(CancellationToken ct = default)
    {
        var expired = await _db.RefreshTokens
            .Where(rt => rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(ct);

        _db.RefreshTokens.RemoveRange(expired);
        await _db.SaveChangesAsync(ct);
    }

    private static string GenerateRandomToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
