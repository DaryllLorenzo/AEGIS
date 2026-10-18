using Aegis.Api.Data;
using Aegis.Api.Modules.Faculties.Data;
using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Api.Modules.Faculties.Mappings;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Faculties.Features.CreateFaculty;

public sealed class CreateFacultyHandler : IRequestHandler<CreateFacultyRequest, Result<FacultyDto>>
{
    private readonly AegisDbContext _db;

    public CreateFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result<FacultyDto>> Handle(CreateFacultyRequest request, CancellationToken cancellationToken)
    {
        var code = string.IsNullOrWhiteSpace(request.Code) ? null : request.Code.Trim();

        if (code is not null)
        {
            var codeTaken = await _db.Faculties
                .AnyAsync(f => f.Code == code, cancellationToken);

            if (codeTaken)
            {
                return Error.Conflict("Faculty.CodeExists", $"A faculty with code '{code}' already exists.");
            }
        }

        var faculty = new Faculty
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = code,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Faculties.Add(faculty);
        await _db.SaveChangesAsync(cancellationToken);

        return faculty.ToDto();
    }
}
