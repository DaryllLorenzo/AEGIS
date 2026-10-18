using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Features.CreateUser;
using Aegis.Api.Tests.Fixtures;
using Aegis.Common.Result;

namespace Aegis.Api.Tests.Modules.Users.Features.CreateUser;

public sealed class CreateUserHandlerTests : IDisposable
{
    private readonly TestDb _db = new();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsConflict()
    {
        _db.Db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "taken@aegis.dev",
            DisplayName = "Existing",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password", workFactor: 4),
            CreatedAt = DateTimeOffset.UtcNow,
        });
        _db.Db.SaveChanges();

        var handler = new CreateUserHandler(_db.Db);

        var result = await handler.Handle(
            new CreateUserRequest { Email = "taken@aegis.dev", DisplayName = "New", Password = "Password123!" },
            default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);
        Assert.Equal("User.EmailExists", result.Error.Code);
    }

    [Fact]
    public async Task Handle_NewEmail_CreatesUser()
    {
        var handler = new CreateUserHandler(_db.Db);

        var result = await handler.Handle(
            new CreateUserRequest { Email = "new@aegis.dev", DisplayName = "New", Password = "Password123!" },
            default);

        Assert.True(result.IsSuccess);
        Assert.Equal("new@aegis.dev", result.Value.Email);
    }
}
