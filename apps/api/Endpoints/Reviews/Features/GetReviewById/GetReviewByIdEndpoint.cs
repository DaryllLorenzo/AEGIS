using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviewById;

internal static class GetReviewByIdEndpoint
{
    internal const string Name = "GetReviewById";

    internal static RouteHandlerBuilder MapGetReviewByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a review by its ID.");

        static async Task<Results<Ok<ReviewDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(new GetReviewByIdRequest(id), cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (ReviewNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
