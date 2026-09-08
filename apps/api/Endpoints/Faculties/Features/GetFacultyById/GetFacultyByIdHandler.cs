using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Exceptions;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFacultyById;

public sealed class GetFacultyByIdHandler : IRequestHandler<GetFacultyByIdRequest, FacultyDto>
{
    private readonly AegisDbContext _db;

    public GetFacultyByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<FacultyDto> Handle(GetFacultyByIdRequest request, CancellationToken ct)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], ct)
            ?? throw new FacultyNotFoundException(request.Id);

        return new FacultyDto
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
}
