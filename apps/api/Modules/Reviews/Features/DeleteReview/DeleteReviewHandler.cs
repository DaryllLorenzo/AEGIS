using Aegis.Api.Data;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.DeleteReview;

public sealed class DeleteReviewHandler : IRequestHandler<DeleteReviewRequest, Result>
{
    private readonly AegisDbContext _db;

    public DeleteReviewHandler(AegisDbContext db) => _db = db;

    public async Task<Result> Handle(DeleteReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await _db.Reviews.FindAsync([request.Id], cancellationToken);

        if (review is null)
        {
            return Error.NotFound("Review.NotFound", $"Review with ID '{request.Id}' was not found.");
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
