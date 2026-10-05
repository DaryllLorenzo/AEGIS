using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;

namespace Aegis.Api.Endpoints.Reviews.Mappings;

public static class ManualReviewMappings
{
    public static ReviewDto ToDto(this Review review) => new()
    {
        Id = review.Id,
        DocumentId = review.DocumentId,
        UserId = review.UserId,
        Title = review.Title,
        Kind = review.Kind,
        Version = review.Version,
        Status = review.Status,
        DueDate = review.DueDate,
        AssigneeId = review.AssigneeId,
        AssigneeName = review.AssigneeUser != null ? review.AssigneeUser.DisplayName : null,
        IsActive = review.IsActive,
        CreatedAt = review.CreatedAt,
        UpdatedAt = review.UpdatedAt,
    };
}
