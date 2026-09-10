using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetUserById;

public sealed class GetUserByIdHandler : IRequestHandler<GetUserByIdRequest, UserDto>
{
    private readonly AegisDbContext _db;

    public GetUserByIdHandler(AegisDbContext db) => _db = db;

    public async Task<UserDto> Handle(GetUserByIdRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([request.Id], ct)
            ?? throw new UserNotFoundException(request.Id);

        return user.ToDto();
    }
}
