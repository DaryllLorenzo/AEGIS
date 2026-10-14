using Aegis.Api.Data;
using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Api.Modules.Faculties.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.GetFacultyById;

public sealed class GetFacultyByIdHandler : IRequestHandler<GetFacultyByIdRequest, Result<FacultyDto>>
{
    private readonly AegisDbContext _db;

    public GetFacultyByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result<FacultyDto>> Handle(GetFacultyByIdRequest request, CancellationToken cancellationToken)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], cancellationToken);

        if (faculty is null)
        {
            return Error.NotFound("Faculty.NotFound", $"Faculty with ID '{request.Id}' was not found.");
        }

        return faculty.ToDto();
    }
}
