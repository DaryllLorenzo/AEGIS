using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Exceptions;
using Aegis.Api.Endpoints.Faculties.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFacultyById;

public sealed class GetFacultyByIdHandler : IRequestHandler<GetFacultyByIdRequest, FacultyDto>
{
    private readonly AegisDbContext _db;

    public GetFacultyByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<FacultyDto> Handle(GetFacultyByIdRequest request, CancellationToken cancellationToken)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], cancellationToken)
            ?? throw new FacultyNotFoundException(request.Id);

        return faculty.ToDto();
    }
}
