using Aegis.Api.Data;
using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Api.Modules.Roles.Mappings;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Roles.Features.CreateRole;

public sealed class CreateRoleHandler : IRequestHandler<CreateRoleRequest, Result<RoleDto>>
{
    private readonly AegisDbContext _db;

    public CreateRoleHandler(AegisDbContext db) => _db = db;

    public async Task<Result<RoleDto>> Handle(CreateRoleRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();

        var alreadyExists = await _db.Roles
            .AnyAsync(r => r.Name == name, cancellationToken);

        if (alreadyExists)
        {
            return Error.Conflict("Role.NameExists", $"A role named '{name}' already exists.");
        }

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(cancellationToken);

        return role.ToDto();
    }
}
