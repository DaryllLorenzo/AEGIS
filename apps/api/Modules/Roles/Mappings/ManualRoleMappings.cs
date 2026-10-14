using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Roles.Dtos;

namespace Aegis.Api.Modules.Roles.Mappings;

public static class ManualRoleMappings
{
    public static RoleDto ToDto(this Role role) => new()
    {
        Id = role.Id,
        Name = role.Name,
        Description = role.Description,
        CreatedAt = role.CreatedAt,
        UpdatedAt = role.UpdatedAt,
    };
}
