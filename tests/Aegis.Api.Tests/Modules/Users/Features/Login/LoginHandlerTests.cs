using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Features.Login;
using Aegis.Api.Modules.Users.Services;
using Aegis.Api.Tests.Fixtures;
using Aegis.Common.Result;
using Microsoft.Extensions.Options;

namespace Aegis.Api.Tests.Modules.Users.Features.Login;

public sealed class LoginHandlerTests : IDisposable
{
    private readonly TestDb _db = new();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_UnknownEmail_ReturnsUnauthorized()
    {
        var handler = CreateHandler();

        var result = await handler.Handle(
            new LoginRequest { Email = "nobody@aegis.dev", Password = "secret" }, default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Unauthorized, result.Error.Type);
        Assert.Equal("Auth.InvalidCredentials", result.Error.Code);
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsUnauthorized()
    {
        SeedUser("user@aegis.dev", BCrypt.Net.BCrypt.HashPassword("correct-password", workFactor: 4));
        var handler = CreateHandler();

        var result = await handler.Handle(
            new LoginRequest { Email = "user@aegis.dev", Password = "wrong-password" }, default);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidCredentials", result.Error.Code);
    }

    [Fact]
    public async Task Handle_InactiveUser_ReturnsUnauthorized()
    {
        SeedUser("user@aegis.dev", BCrypt.Net.BCrypt.HashPassword("correct-password", workFactor: 4), isActive: false);
        var handler = CreateHandler();

        var result = await handler.Handle(
            new LoginRequest { Email = "user@aegis.dev", Password = "correct-password" }, default);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidCredentials", result.Error.Code);
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsTokens()
    {
        SeedUser("user@aegis.dev", BCrypt.Net.BCrypt.HashPassword("correct-password", workFactor: 4));
        var handler = CreateHandler();

        var result = await handler.Handle(
            new LoginRequest { Email = "user@aegis.dev", Password = "correct-password" }, default);

        Assert.True(result.IsSuccess);
        Assert.False(string.IsNullOrEmpty(result.Value.Token));
        Assert.False(string.IsNullOrEmpty(result.Value.RefreshToken));
        Assert.Equal("user@aegis.dev", result.Value.Email);

        // Only the hash of the refresh token is persisted, never the raw value.
        var rawToken = result.Value.RefreshToken;
        var storedHash = RefreshTokenService.HashToken(rawToken);
        Assert.Equal(1, _db.Db.RefreshTokens.Count(rt => rt.Token == storedHash));
        Assert.Equal(0, _db.Db.RefreshTokens.Count(rt => rt.Token == rawToken));
    }

    private LoginHandler CreateHandler()
    {
        var options = Options.Create(TestConfig.JwtOptions());
        return new LoginHandler(
            _db.Db,
            new JwtTokenService(options),
            new RefreshTokenService(_db.Db, options));
    }

    private Guid SeedUser(string email, string passwordHash, bool isActive = true)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = "Test User",
            PasswordHash = passwordHash,
            IsActive = isActive,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.Db.Users.Add(user);
        _db.Db.SaveChanges();
        return user.Id;
    }
}
