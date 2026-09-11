using Aegis.Api.Data;
using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Endpoints.Roles.Exceptions;
using Aegis.Api.Endpoints.Roles.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoleById;

public sealed class GetRoleByIdHandler : IRequestHandler<GetRoleByIdRequest, RoleDto>
{
    private readonly AegisDbContext _db;

    public GetRoleByIdHandler(AegisDbContext db) => _db = db;

    public async Task<RoleDto> Handle(GetRoleByIdRequest request, CancellationToken ct)
    {
        var role = await _db.Roles.FindAsync([request.Id], ct)
            ?? throw new RoleNotFoundException(request.Id);

        return role.ToDto();
    }
}
