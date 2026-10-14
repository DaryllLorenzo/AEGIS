using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.UpdateReview;

public sealed record UpdateReviewRequest : IRequest<Result<ReviewDto>>
{
    public Guid Id { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public ReviewStatus Status { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public Guid? AssigneeId { get; init; }
}
