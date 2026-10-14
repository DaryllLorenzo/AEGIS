using Aegis.Api.Data;
using Aegis.Api.Modules.Users.Dtos;
using Aegis.Api.Modules.Users.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.GetUserById;

public sealed class GetUserByIdHandler : IRequestHandler<GetUserByIdRequest, Result<UserDto>>
{
    private readonly AegisDbContext _db;

    public GetUserByIdHandler(AegisDbContext db) => _db = db;

    public async Task<Result<UserDto>> Handle(GetUserByIdRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FindAsync([request.Id], cancellationToken);

        if (user is null)
        {
            return Error.NotFound("User.NotFound", $"User with ID '{request.Id}' was not found.");
        }

        return user.ToDto();
    }
}
