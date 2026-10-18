using Aegis.Api.Modules.Reviews.Features.CreateReview;
using Aegis.Api.Modules.Reviews.Features.DeleteReview;
using Aegis.Api.Modules.Reviews.Features.GetReviewById;
using Aegis.Api.Modules.Reviews.Features.GetReviews;
using Aegis.Api.Modules.Reviews.Features.UpdateReview;
using Aegis.Api.Modules.Reviews.Services;

namespace Aegis.Api.Modules.Reviews;

internal static class ReviewsConfigurations
{
    public const string Tag = "Reviews";
    public const string ReviewsPrefixUri = "api/reviews";

    internal static WebApplicationBuilder AddReviewsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<ReviewSieveProcessor>();
        return builder;
    }

    internal static IEndpointRouteBuilder MapReviewsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var reviews = endpoints.MapGroup(ReviewsPrefixUri);
        reviews.MapGetReviewsEndpoint();
        reviews.MapGetReviewByIdEndpoint();
        reviews.MapCreateReviewEndpoint();
        reviews.MapUpdateReviewEndpoint();
        reviews.MapDeleteReviewEndpoint();
        return endpoints;
    }
}
