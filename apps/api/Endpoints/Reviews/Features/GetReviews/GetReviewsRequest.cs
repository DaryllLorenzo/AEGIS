using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviews;

public sealed record GetReviewsRequest : SieveRequest, IRequest<PaginatedList<ReviewDto>>
{
    public Guid? GroupId { get; init; }
}
