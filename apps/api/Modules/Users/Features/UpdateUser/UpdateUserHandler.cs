using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Dtos;
using Aegis.Api.Modules.Users.Mappings;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Users.Features.UpdateUser;

public sealed class UpdateUserHandler : IRequestHandler<UpdateUserRequest, Result<UserDto>>
{
    private readonly AegisDbContext _db;

    public UpdateUserHandler(AegisDbContext db) => _db = db;

    public async Task<Result<UserDto>> Handle(UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FindAsync([request.Id], cancellationToken);

        if (user is null)
        {
            return Error.NotFound("User.NotFound", $"User with ID '{request.Id}' was not found.");
        }

        var email = request.Email.Trim();

        var emailTaken = await _db.Users
            .AnyAsync(u => u.Email == email && u.Id != user.Id, cancellationToken);

        if (emailTaken)
        {
            return Error.Conflict("User.EmailExists", $"A user with email '{email}' already exists.");
        }

        user.Email = email;
        user.DisplayName = request.DisplayName;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return user.ToDto();
    }
}
