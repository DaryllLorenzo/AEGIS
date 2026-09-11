using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using Aegis.Api.Endpoints.Reviews.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.UpdateReview;

public sealed class UpdateReviewHandler : IRequestHandler<UpdateReviewRequest, ReviewDto>
{
    private readonly AegisDbContext _db;

    public UpdateReviewHandler(AegisDbContext db) => _db = db;

    public async Task<ReviewDto> Handle(UpdateReviewRequest request, CancellationToken ct)
    {
        var review = await _db.Reviews.FindAsync([request.Id], ct)
            ?? throw new ReviewNotFoundException(request.Id);

        if (review.Status == ReviewStatus.Completed)
        {
            throw new ReviewAlreadyCompletedException(request.Id);
        }

        var newStatus = request.Status;
        if (newStatus != review.Status)
        {
            var isValidTransition = (review.Status, newStatus) switch
            {
                (ReviewStatus.Pending, ReviewStatus.InProgress) => true,
                (ReviewStatus.InProgress, ReviewStatus.Completed) => true,
                _ => false,
            };

            if (!isValidTransition)
            {
                throw new InvalidReviewTransitionException(
                    review.Status.ToString(), newStatus.ToString());
            }
        }

        review.Title = request.Title;
        review.Kind = request.Kind;
        review.Version = request.Version;
        review.Status = newStatus;
        review.DueDate = request.DueDate;
        review.Assignee = request.Assignee;
        review.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return review.ToDto();
    }
}
