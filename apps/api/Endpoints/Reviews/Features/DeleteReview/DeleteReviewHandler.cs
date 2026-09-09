using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.DeleteReview;

public sealed class DeleteReviewHandler : IRequestHandler<DeleteReviewRequest, Unit>
{
    private readonly AegisDbContext _db;

    public DeleteReviewHandler(AegisDbContext db) => _db = db;

    public async Task<Unit> Handle(DeleteReviewRequest request, CancellationToken ct)
    {
        var review = await _db.Reviews.FindAsync([request.Id], ct)
            ?? throw new ReviewNotFoundException(request.Id);

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
