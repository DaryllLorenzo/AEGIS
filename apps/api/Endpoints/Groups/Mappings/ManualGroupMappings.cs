using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;

namespace Aegis.Api.Endpoints.Groups.Mappings;

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
