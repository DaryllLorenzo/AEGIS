using Aegis.Api.Common.Authz;
using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Api.Modules.Reviews.Mappings;
using Aegis.Api.Modules.Users.Data;
using Aegis.Common.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Reviews.Features.UpdateReview;

public sealed class UpdateReviewHandler : IRequestHandler<UpdateReviewRequest, Result<ReviewDto>>
{
    private readonly AegisDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UpdateReviewHandler(AegisDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<ReviewDto>> Handle(UpdateReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await _db.Reviews.FindAsync([request.Id], cancellationToken);

        if (review is null)
        {
            return Error.NotFound("Review.NotFound", $"Review with ID '{request.Id}' was not found.");
        }

        if (review.Status == ReviewStatus.Completed)
        {
            return Error.Validation("status", "This review is completed and cannot be modified.");
        }

        // Loaded at most once and reused by the transition and reassignment checks below.
        Document? document = null;

        async Task<Document?> GetDocumentAsync()
        {
            document ??= await _db.Documents.FindAsync([review.DocumentId], cancellationToken);
            return document;
        }

        var newStatus = request.Status;
        if (newStatus != review.Status)
        {
            if (!ReviewTransitions.CanTransition(review.Status, newStatus))
            {
                return Error.Validation(
                    "status",
                    $"Cannot transition review from '{review.Status}' to '{newStatus}'.");
            }

            // Authorizing the transition:
            //  - Start (Pending -> InProgress): needs the Reviewer role in
            //    the document's group. Submitters are read-only.
            //  - Complete (InProgress -> Completed): needs to be the review's
            //    assignee. No one else can complete a review.
            var me = CurrentUserId();
            var doc = await GetDocumentAsync();

            if (doc is null)
            {
                // Orphaned review (document deleted): same as before, a server error.
                return Error.Failure("Review.DocumentMissing", $"Document '{review.DocumentId}' was not found.");
            }

            if (newStatus == ReviewStatus.InProgress && me.HasValue)
            {
                var roles = await GroupRoles.RolesOfUserAsync(_db, me.Value, doc.GroupId, cancellationToken);
                if (!roles.Contains(GroupRoles.Reviewer))
                {
                    return Error.Forbidden("Review.Permission", "Only Reviewers in this group can start a review.");
                }
            }

            if (newStatus == ReviewStatus.Completed)
            {
                if (!me.HasValue || review.AssigneeId != me.Value)
                {
                    return Error.Forbidden("Review.Permission", "Only the assignee of this review can complete it.");
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
                var doc = await GetDocumentAsync();

                if (doc is null)
                {
                    return Error.Failure("Review.DocumentMissing", $"Document '{review.DocumentId}' was not found.");
                }

                var isGroupMember = await _db.UserRoles.AnyAsync(
                    ur => ur.UserId == request.AssigneeId.Value && ur.GroupId == doc.GroupId, cancellationToken);

                if (!isGroupMember)
                {
                    return Error.Validation(
                        "assigneeId",
                        $"User '{request.AssigneeId.Value}' is not a member of group '{doc.GroupId}' and cannot be assigned.");
                }
            }

            review.AssigneeId = request.AssigneeId;
        }

        await _db.SaveChangesAsync(cancellationToken);

        await _db.Entry(review).Reference(r => r.AssigneeUser).LoadAsync(cancellationToken);

        return review.ToDto();
    }

    private Guid? CurrentUserId() => _httpContextAccessor.HttpContext?.User.GetUserId();
}
