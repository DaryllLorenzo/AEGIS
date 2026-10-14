using Aegis.Api.Data;
using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Api.Modules.Faculties.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.UpdateFaculty;

public sealed class UpdateFacultyHandler : IRequestHandler<UpdateFacultyRequest, Result<FacultyDto>>
{
    private readonly AegisDbContext _db;

    public UpdateFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result<FacultyDto>> Handle(UpdateFacultyRequest request, CancellationToken cancellationToken)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], cancellationToken);

        if (faculty is null)
        {
            return Error.NotFound("Faculty.NotFound", $"Faculty with ID '{request.Id}' was not found.");
        }

        faculty.Name = request.Name;
        faculty.Code = request.Code;
        faculty.Description = request.Description;
        faculty.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return faculty.ToDto();
    }
}
