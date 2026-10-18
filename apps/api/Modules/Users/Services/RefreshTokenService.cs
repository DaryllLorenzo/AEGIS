using System.Security.Cryptography;
using System.Text;
using Aegis.Api.Configuration;
using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aegis.Api.Modules.Users.Services;

public sealed class RefreshTokenService
{
    private readonly AegisDbContext _db;
    private readonly JwtOptions _options;

    public RefreshTokenService(AegisDbContext db, IOptions<JwtOptions> options)
    {
        _db = db;
        _options = options.Value;
    }

    /// <summary>Persists a new refresh token (hash only); returns the row and the raw token.</summary>
    public async Task<(RefreshToken Token, string RawToken)> GenerateRefreshTokenAsync(
        Guid userId,
        CancellationToken ct = default)
    {
        var rawToken = GenerateRandomToken();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_options.RefreshExpiresInDays),
            IsRevoked = false,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(ct);

        return (refreshToken, rawToken);
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var hash = HashToken(token);

        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == hash && !rt.IsRevoked, ct);

        if (refreshToken is null || refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        return refreshToken;
    }

    public async Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var hash = HashToken(token);

        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == hash, ct);

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

    /// <summary>SHA-256 of the raw token, stored in place of the token itself.</summary>
    public static string HashToken(string token) =>
        Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string GenerateRandomToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
