using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Dtos;
using Aegis.Api.Modules.Users.Mappings;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Users.Features.CreateUser;

public sealed class CreateUserHandler : IRequestHandler<CreateUserRequest, Result<UserDto>>
{
    private readonly AegisDbContext _db;

    public CreateUserHandler(AegisDbContext db) => _db = db;

    public async Task<Result<UserDto>> Handle(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();

        var alreadyExists = await _db.Users
            .AnyAsync(u => u.Email == email, cancellationToken);

        if (alreadyExists)
        {
            return Error.Conflict("User.EmailExists", $"A user with email '{email}' already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = request.DisplayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return user.ToDto();
    }
}
