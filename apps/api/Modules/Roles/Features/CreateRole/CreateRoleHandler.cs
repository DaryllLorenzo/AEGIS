using Aegis.Api.Data;
using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Api.Modules.Roles.Mappings;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.CreateRole;

public sealed class CreateRoleHandler : IRequestHandler<CreateRoleRequest, RoleDto>
{
    private readonly AegisDbContext _db;

    public CreateRoleHandler(AegisDbContext db) => _db = db;

    public async Task<RoleDto> Handle(CreateRoleRequest request, CancellationToken cancellationToken)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(cancellationToken);

        return role.ToDto();
    }
}
