using System.Security.Claims;
using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using Aegis.Api.Endpoints.Reviews.Mappings;
using Aegis.Api.Endpoints.Users.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Reviews.Features.UpdateReview;

public sealed class UpdateReviewHandler : IRequestHandler<UpdateReviewRequest, ReviewDto>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UpdateReviewHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

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

            // Authorizing the transition:
            //  - Start (Pending -> InProgress): needs the Reviewer role in
            //    the document's group. Submitters are read-only.
            //  - Complete (InProgress -> Completed): needs to be the review's
            //    assignee. No one else can complete a review.
            var me = CurrentUserId();
            var document = await _db.Documents.FindAsync([review.DocumentId], ct)
                ?? throw new DocumentNotFoundException(review.DocumentId);

            if (newStatus == ReviewStatus.InProgress && me.HasValue)
            {
                var roles = await GroupRoles.RolesOfUserAsync(_db, me.Value, document.GroupId, ct);
                if (!roles.Contains(GroupRoles.Reviewer))
                {
                    throw new ReviewPermissionException("Only Reviewers in this group can start a review.");
                }
            }

            if (newStatus == ReviewStatus.Completed)
            {
                if (!me.HasValue || review.AssigneeId != me.Value)
                {
                    throw new ReviewPermissionException("Only the assignee of this review can complete it.");
                }
            }
        }

        review.Title = request.Title;
        review.Kind = request.Kind;
        review.Version = request.Version;
        review.Status = newStatus;
        review.DueDate = request.DueDate;
        review.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.AssigneeId != review.AssigneeId)
        {
            if (request.AssigneeId.HasValue)
            {
                var document = await _db.Documents.FindAsync([review.DocumentId], ct)
                    ?? throw new DocumentNotFoundException(review.DocumentId);

                var isGroupMember = await _db.UserRoles.AnyAsync(
                    ur => ur.UserId == request.AssigneeId.Value && ur.GroupId == document.GroupId, ct);

                if (!isGroupMember)
                {
                    throw new InvalidAssigneeException(request.AssigneeId.Value, document.GroupId);
                }
            }

            review.AssigneeId = request.AssigneeId;
        }

        await _db.SaveChangesAsync(ct);

        await _db.Entry(review).Reference(r => r.AssigneeUser).LoadAsync(ct);

        return review.ToDto();
    }

    private Guid? CurrentUserId()
    {
        if (_httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier) is { } parsed
            && Guid.TryParse(parsed, out var guid))
        {
            return guid;
        }
        return null;
    }
}
