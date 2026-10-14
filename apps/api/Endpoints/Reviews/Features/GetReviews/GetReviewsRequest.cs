using Aegis.Api.Common.Paging;
using Aegis.Api.Endpoints.Reviews.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviews;

public sealed record GetReviewsRequest : SieveRequest, IRequest<PaginatedList<ReviewDto>>
{
    public Guid? GroupId { get; init; }
}
