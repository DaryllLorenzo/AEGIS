using Aegis.Api.Common.Results;
using Aegis.Common.Result;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Reviews.Features.DeleteReview;

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
            var result = await sender.Send(new DeleteReviewRequest(id), cancellationToken);
            return result.ToNoContentOrNotFound();
        }
    }
}
