using Aegis.Api.Endpoints.Reviews.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.CreateReview;

public sealed record CreateReviewRequest : IRequest<ReviewDto>
{
    public Guid DocumentId { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public string? Assignee { get; init; }
}
