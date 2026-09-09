using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.CreateReview;

public sealed class CreateReviewHandler : IRequestHandler<CreateReviewRequest, ReviewDto>
{
    private readonly AegisDbContext _db;

    public CreateReviewHandler(AegisDbContext db) => _db = db;

    public async Task<ReviewDto> Handle(CreateReviewRequest request, CancellationToken ct)
    {
        var review = new Review
        {
            Id = Guid.NewGuid(),
            DocumentId = request.DocumentId,
            Title = request.Title,
            Kind = request.Kind,
            Version = request.Version,
            Status = request.Status,
            DueDate = request.DueDate,
            Assignee = request.Assignee,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        return review.ToDto();
    }
}
