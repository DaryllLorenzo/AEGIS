using Aegis.Api.Endpoints.Roles.Data;
using Aegis.Api.Endpoints.Roles.Dtos;

namespace Aegis.Api.Endpoints.Roles.Mappings;

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
