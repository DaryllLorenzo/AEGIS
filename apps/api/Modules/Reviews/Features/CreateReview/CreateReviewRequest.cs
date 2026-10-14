using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.CreateReview;

public sealed record CreateReviewRequest : IRequest<Result<ReviewDto>>
{
    public Guid DocumentId { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public Guid? AssigneeId { get; init; }
}
