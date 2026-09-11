using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.CreateReview;

public sealed class CreateReviewHandler : IRequestHandler<CreateReviewRequest, ReviewDto>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateReviewHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ReviewDto> Handle(CreateReviewRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var review = new Review
        {
            Id = Guid.NewGuid(),
            DocumentId = request.DocumentId,
            UserId = userId,
            Title = request.Title,
            Kind = request.Kind,
            Version = request.Version,
            Status = ReviewStatus.Pending,
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
