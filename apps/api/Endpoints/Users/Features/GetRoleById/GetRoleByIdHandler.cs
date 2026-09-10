using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetRoleById;

public sealed class GetRoleByIdHandler : IRequestHandler<GetRoleByIdRequest, RoleDto>
{
    private readonly AegisDbContext _db;

    public GetRoleByIdHandler(AegisDbContext db) => _db = db;

    public async Task<RoleDto> Handle(GetRoleByIdRequest request, CancellationToken ct)
    {
        var role = await _db.Roles.FindAsync([request.Id], ct)
            ?? throw new UserNotFoundException(request.Id);

        return role.ToDto();
    }
}
