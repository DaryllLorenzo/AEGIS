using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.GetReviewById;

public sealed record GetReviewByIdRequest(Guid Id) : IRequest<Result<ReviewDto>>;
