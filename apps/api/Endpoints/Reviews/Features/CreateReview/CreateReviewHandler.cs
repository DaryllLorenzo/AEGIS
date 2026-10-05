using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using Aegis.Api.Endpoints.Reviews.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

        var document = await _db.Documents.FindAsync([request.DocumentId], ct)
            ?? throw new DocumentNotFoundException(request.DocumentId);

        // The assignee must be a member of the document's group.
        if (request.AssigneeId.HasValue)
        {
            var isGroupMember = await _db.UserRoles.AnyAsync(
                ur => ur.UserId == request.AssigneeId.Value && ur.GroupId == document.GroupId, ct);

            if (!isGroupMember)
            {
                throw new InvalidAssigneeException(request.AssigneeId.Value, document.GroupId);
            }
        }

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
            AssigneeId = request.AssigneeId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(review).Reference(r => r.AssigneeUser).LoadAsync(ct);

        return review.ToDto();
    }
}
