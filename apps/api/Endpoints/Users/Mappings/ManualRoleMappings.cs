using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;

namespace Aegis.Api.Endpoints.Users.Mappings;

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
