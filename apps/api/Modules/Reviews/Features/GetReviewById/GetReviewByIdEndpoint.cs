using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Reviews.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Reviews.Features.GetReviewById;

internal static class GetReviewByIdEndpoint
{
    internal const string Name = "GetReviewById";

    internal static RouteHandlerBuilder MapGetReviewByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a review by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<ReviewDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new GetReviewByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
