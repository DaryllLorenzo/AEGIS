using Aegis.Api.Modules.Faculties.Data;
using Aegis.Api.Modules.Faculties.Dtos;

namespace Aegis.Api.Modules.Faculties.Mappings;

public static class ManualFacultyMappings
{
    public static FacultyDto ToDto(this Faculty faculty) => new()
    {
        Id = faculty.Id,
        Name = faculty.Name,
        Code = faculty.Code,
        Description = faculty.Description,
        IsActive = faculty.IsActive,
        CreatedAt = faculty.CreatedAt,
        UpdatedAt = faculty.UpdatedAt,
    };
}
