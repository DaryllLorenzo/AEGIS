using Aegis.Api.Data;
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

        review.Title = request.Title;
        review.Kind = request.Kind;
        review.Version = request.Version;
        review.Status = request.Status;
        review.DueDate = request.DueDate;
        review.Assignee = request.Assignee;
        review.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return review.ToDto();
    }
}
