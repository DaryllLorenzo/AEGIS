using Aegis.Api.Endpoints.Reviews.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Reviews.Features.DeleteReview;

internal static class DeleteReviewEndpoint
{
    internal const string Name = "DeleteReview";

    internal static RouteHandlerBuilder MapDeleteReviewEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapDelete("/{id:guid}", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Deletes a review.")
            .RequireAuthorization();

        static async Task<Results<NoContent, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                await sender.Send(new DeleteReviewRequest(id), cancellationToken);
                return TypedResults.NoContent();
            }
            catch (ReviewNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
