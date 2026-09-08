using Aegis.Api.Endpoints.Faculties.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Shared.Paging;

namespace Aegis.Api.Endpoints.Faculties.Mappings;

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
