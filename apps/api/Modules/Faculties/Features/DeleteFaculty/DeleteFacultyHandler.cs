using Aegis.Api.Data;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.DeleteFaculty;

public sealed class DeleteFacultyHandler : IRequestHandler<DeleteFacultyRequest, Result>
{
    private readonly AegisDbContext _db;

    public DeleteFacultyHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(DeleteFacultyRequest request, CancellationToken cancellationToken)
    {
        var faculty = await _db.Faculties.FindAsync([request.Id], cancellationToken);

        if (faculty is null)
        {
            return Error.NotFound("Faculty.NotFound", $"Faculty with ID '{request.Id}' was not found.");
        }

        _db.Faculties.Remove(faculty);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
