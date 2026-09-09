using Aegis.Api.Endpoints.Reviews.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviewById;

public sealed record GetReviewByIdRequest(Guid Id) : IRequest<ReviewDto>;
