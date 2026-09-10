using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.UpdateUser;

public sealed class UpdateUserHandler : IRequestHandler<UpdateUserRequest, UserDto>
{
    private readonly AegisDbContext _db;

    public UpdateUserHandler(AegisDbContext db) => _db = db;

    public async Task<UserDto> Handle(UpdateUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([request.Id], ct)
            ?? throw new UserNotFoundException(request.Id);

        user.Email = request.Email;
        user.DisplayName = request.DisplayName;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return user.ToDto();
    }
}
