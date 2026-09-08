using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Exceptions;
using Aegis.Api.Endpoints.Faculties.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.UpdateFaculty;

public sealed class UpdateFacultyHandler : IRequestHandler<UpdateFacultyRequest, FacultyDto>
{
    private readonly AegisDbContext _db;

    public UpdateFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<FacultyDto> Handle(UpdateFacultyRequest request, CancellationToken ct)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], ct)
            ?? throw new FacultyNotFoundException(request.Id);

        faculty.Name = request.Name;
        faculty.Code = request.Code;
        faculty.Description = request.Description;
        faculty.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return faculty.ToDto();
    }
}
