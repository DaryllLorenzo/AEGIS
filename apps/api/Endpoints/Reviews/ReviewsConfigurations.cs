using Aegis.Api.Endpoints.Reviews.Features.CreateReview;
using Aegis.Api.Endpoints.Reviews.Features.DeleteReview;
using Aegis.Api.Endpoints.Reviews.Features.GetReviewById;
using Aegis.Api.Endpoints.Reviews.Features.GetReviews;
using Aegis.Api.Endpoints.Reviews.Features.UpdateReview;
using Aegis.Api.Endpoints.Reviews.Services;
using FluentValidation;

namespace Aegis.Api.Endpoints.Reviews;

internal static class ReviewsConfigurations
{
    public const string Tag = "Reviews";
    public const string ReviewsPrefixUri = "api/reviews";

    internal static WebApplicationBuilder AddReviewsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<ReviewSieveProcessor>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateReviewValidator>();
        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetReviewsRequest>());
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
