using Aegis.Api.Common.Paging;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Data;
using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.CreateFaculty;

public sealed class CreateFacultyHandler : IRequestHandler<CreateFacultyRequest, FacultyDto>
{
    private readonly AegisDbContext _db;

    public CreateFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<FacultyDto> Handle(CreateFacultyRequest request, CancellationToken cancellationToken)
    {
        var faculty = new Faculty
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Faculties.Add(faculty);
        await _db.SaveChangesAsync(cancellationToken);

        return faculty.ToDto();
    }
}
