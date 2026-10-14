using Aegis.Api.Data;
using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Api.Modules.Roles.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.GetRoleById;

public sealed class GetRoleByIdHandler : IRequestHandler<GetRoleByIdRequest, Result<RoleDto>>
{
    private readonly AegisDbContext _db;

    public GetRoleByIdHandler(AegisDbContext db) => _db = db;

    public async Task<Result<RoleDto>> Handle(GetRoleByIdRequest request, CancellationToken cancellationToken)
    {
        var role = await _db.Roles.FindAsync([request.Id], cancellationToken);

        if (role is null)
        {
            return Error.NotFound("Role.NotFound", $"Role with ID '{request.Id}' was not found.");
        }

        return role.ToDto();
    }
}
