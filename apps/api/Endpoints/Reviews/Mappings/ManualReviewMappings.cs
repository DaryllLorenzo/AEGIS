using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;

namespace Aegis.Api.Endpoints.Reviews.Mappings;

public static class ManualReviewMappings
{
    public static ReviewDto ToDto(this Review review) => new()
    {
        Id = review.Id,
        DocumentId = review.DocumentId,
        Title = review.Title,
        Kind = review.Kind,
        Version = review.Version,
        Status = review.Status,
        DueDate = review.DueDate,
        Assignee = review.Assignee,
        IsActive = review.IsActive,
        CreatedAt = review.CreatedAt,
        UpdatedAt = review.UpdatedAt,
    };
}
