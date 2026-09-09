using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviews;

internal static class GetReviewsEndpoint
{
    internal const string Name = "GetReviews";

    internal static RouteHandlerBuilder MapGetReviewsEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of reviews.")
            .WithDescription("Supports filtering, sorting and pagination via Sieve query parameters.");

        static async Task<Ok<PaginatedList<ReviewDto>>> Handle(
            [AsParameters] GetReviewsParameters parameters,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var sieve = new Sieve.Models.SieveModel
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                Filters = parameters.Filters,
                Sorts = parameters.Sorts,
            };

            var result = await sender.Send(new GetReviewsRequest { Sieve = sieve }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetReviewsParameters
{
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
