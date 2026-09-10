using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;

namespace Aegis.Api.Endpoints.Users.Mappings;

public static class ManualGroupMappings
{
    public static GroupDto ToDto(this Group group) => new()
    {
        Id = group.Id,
        Name = group.Name,
        FacultyId = group.FacultyId,
        Description = group.Description,
        CreatedAt = group.CreatedAt,
        UpdatedAt = group.UpdatedAt,
    };
}
