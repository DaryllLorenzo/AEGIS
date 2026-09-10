using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.CreateUser;

public sealed class CreateUserHandler : IRequestHandler<CreateUserRequest, UserDto>
{
    private readonly AegisDbContext _db;

    public CreateUserHandler(AegisDbContext db) => _db = db;

    public async Task<UserDto> Handle(CreateUserRequest request, CancellationToken ct)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return user.ToDto();
    }
}
