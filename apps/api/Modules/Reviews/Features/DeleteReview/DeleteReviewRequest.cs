using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.DeleteReview;

public sealed record DeleteReviewRequest(Guid Id) : IRequest<Result>;
