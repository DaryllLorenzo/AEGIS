using Aegis.Api.Common.Authz;
using Aegis.Api.Data;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Api.Modules.Reviews.Mappings;
using Aegis.Api.Modules.Users.Data;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Reviews.Features.CreateReview;

public sealed class CreateReviewHandler : IRequestHandler<CreateReviewRequest, Result<ReviewDto>>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateReviewHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<ReviewDto>> Handle(CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User.GetUserId();

        if (userId is null)
        {
            return Error.Unauthorized("Auth.NoUser", "The current user could not be resolved.");
        }

        var document = await _db.Documents.FindAsync([request.DocumentId], cancellationToken);

        if (document is null)
        {
            return Error.Validation("documentId", $"Document '{request.DocumentId}' was not found.");
        }

        // The assignee must be a member of the document's group.
        if (request.AssigneeId.HasValue)
        {
            var isGroupMember = await _db.UserRoles.AnyAsync(
                ur => ur.UserId == request.AssigneeId.Value && ur.GroupId == document.GroupId, cancellationToken);

            if (!isGroupMember)
            {
                return Error.Validation(
                    "assigneeId",
                    $"User '{request.AssigneeId.Value}' is not a member of group '{document.GroupId}' and cannot be assigned.");
            }
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            DocumentId = request.DocumentId,
            UserId = userId.Value,
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
        await _db.SaveChangesAsync(cancellationToken);

        await _db.Entry(review).Reference(r => r.AssigneeUser).LoadAsync(cancellationToken);

        return review.ToDto();
    }
}
