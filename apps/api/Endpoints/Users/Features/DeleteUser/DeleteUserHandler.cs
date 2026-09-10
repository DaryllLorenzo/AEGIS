using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.DeleteUser;

public sealed class DeleteUserHandler : IRequestHandler<DeleteUserRequest, Unit>
{
    private readonly AegisDbContext _db;

    public DeleteUserHandler(AegisDbContext db) => _db = db;

    public async Task<Unit> Handle(DeleteUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([request.Id], ct)
            ?? throw new UserNotFoundException(request.Id);

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
