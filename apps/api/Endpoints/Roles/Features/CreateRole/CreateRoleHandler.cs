using Aegis.Api.Data;
using Aegis.Api.Endpoints.Roles.Data;
using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Endpoints.Roles.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Roles.Features.CreateRole;

public sealed class CreateRoleHandler : IRequestHandler<CreateRoleRequest, RoleDto>
{
    private readonly AegisDbContext _db;

    public CreateRoleHandler(AegisDbContext db) => _db = db;

    public async Task<RoleDto> Handle(CreateRoleRequest request, CancellationToken ct)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(ct);

        return role.ToDto();
    }
}
