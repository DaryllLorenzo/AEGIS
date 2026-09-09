using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.DeleteReview;

public sealed record DeleteReviewRequest(Guid Id) : IRequest<Unit>;
