using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Dtos;

namespace Aegis.Api.Modules.Users.Mappings;

public static class ManualUserMappings
{
    public static UserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        DisplayName = user.DisplayName,
        IsActive = user.IsActive,
        IsAdmin = user.IsAdmin,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt,
    };
}
