using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Features.Refresh;
using Aegis.Api.Modules.Users.Services;
using Aegis.Api.Tests.Fixtures;
using Aegis.Common.Result;

namespace Aegis.Api.Tests.Modules.Users.Features.Refresh;

public sealed class RefreshHandlerTests : IDisposable
{
    private readonly TestDb _db = new();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_UnknownToken_ReturnsUnauthorized()
    {
        var handler = CreateHandler();

        var result = await handler.Handle(new RefreshRequest { RefreshToken = "unknown" }, default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Unauthorized, result.Error.Type);
        Assert.Equal("Auth.InvalidRefreshToken", result.Error.Code);
    }

    [Fact]
    public async Task Handle_RevokedToken_ReturnsUnauthorized()
    {
        var user = SeedUser(isActive: true);
        var token = SeedRefreshToken(user, revoked: true);
        var handler = CreateHandler();

        var result = await handler.Handle(new RefreshRequest { RefreshToken = token }, default);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidRefreshToken", result.Error.Code);
    }

    [Fact]
    public async Task Handle_ExpiredToken_ReturnsUnauthorized()
    {
        var user = SeedUser(isActive: true);
        var token = SeedRefreshToken(user, expiresAt: DateTime.UtcNow.AddMinutes(-1));
        var handler = CreateHandler();

        var result = await handler.Handle(new RefreshRequest { RefreshToken = token }, default);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidRefreshToken", result.Error.Code);
    }

    [Fact]
    public async Task Handle_InactiveUser_ReturnsUnauthorized()
    {
        var user = SeedUser(isActive: false);
        var token = SeedRefreshToken(user);
        var handler = CreateHandler();

        var result = await handler.Handle(new RefreshRequest { RefreshToken = token }, default);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidRefreshToken", result.Error.Code);
    }

    [Fact]
    public async Task Handle_ValidToken_RotatesToken()
    {
        var user = SeedUser(isActive: true);
        var oldToken = SeedRefreshToken(user);
        var handler = CreateHandler();

        var result = await handler.Handle(new RefreshRequest { RefreshToken = oldToken }, default);

        Assert.True(result.IsSuccess);
        Assert.NotEqual(oldToken, result.Value.RefreshToken);
        Assert.False(string.IsNullOrEmpty(result.Value.Token));
        Assert.True(
            _db.Db.RefreshTokens.First(rt => rt.Token == oldToken).IsRevoked,
            "old refresh token must be revoked after rotation");
    }

    private RefreshHandler CreateHandler()
    {
        var config = TestConfig.Create();
        return new RefreshHandler(
            _db.Db,
            new JwtTokenService(config),
            new RefreshTokenService(_db.Db, config));
    }

    private Guid SeedUser(bool isActive)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@aegis.dev",
            DisplayName = "Test User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password", workFactor: 4),
            IsActive = isActive,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.Db.Users.Add(user);
        _db.Db.SaveChanges();
        return user.Id;
    }

    private string SeedRefreshToken(
        Guid userId,
        bool revoked = false,
        DateTime? expiresAt = null)
    {
        var refresh = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = $"refresh-{Guid.NewGuid()}",
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(7),
            IsRevoked = revoked,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.Db.RefreshTokens.Add(refresh);
        _db.Db.SaveChanges();
        return refresh.Token;
    }
}
