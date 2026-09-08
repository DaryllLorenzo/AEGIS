using Aegis.Api.Data;
using Aegis.Api.Endpoints.Faculties.Exceptions;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.DeleteFaculty;

public sealed class DeleteFacultyHandler : IRequestHandler<DeleteFacultyRequest, Unit>
{
    private readonly AegisDbContext _db;

    public DeleteFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteFacultyRequest request, CancellationToken ct)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], ct)
            ?? throw new FacultyNotFoundException(request.Id);

        _db.Faculties.Remove(faculty);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
