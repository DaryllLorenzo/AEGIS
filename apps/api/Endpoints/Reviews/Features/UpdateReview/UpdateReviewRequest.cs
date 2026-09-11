using Aegis.Api.Endpoints.Reviews.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.UpdateReview;

public sealed record UpdateReviewRequest : IRequest<ReviewDto>
{
    public Guid Id { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public ReviewStatus Status { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public string? Assignee { get; init; }
}
