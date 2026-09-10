using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;

namespace Aegis.Api.Endpoints.Users.Mappings;

public static class ManualUserMappings
{
    public static UserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        DisplayName = user.DisplayName,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt,
    };
}
