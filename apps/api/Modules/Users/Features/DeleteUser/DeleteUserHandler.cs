using Aegis.Api.Data;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.DeleteUser;

public sealed class DeleteUserHandler : IRequestHandler<DeleteUserRequest, Result>
{
    private readonly AegisDbContext _db;

    public DeleteUserHandler(AegisDbContext db) => _db = db;

    public async Task<Result> Handle(DeleteUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FindAsync([request.Id], cancellationToken);

        if (user is null)
        {
            return Error.NotFound("User.NotFound", $"User with ID '{request.Id}' was not found.");
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
