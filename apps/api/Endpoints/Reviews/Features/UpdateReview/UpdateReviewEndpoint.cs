using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Reviews.Features.UpdateReview;

internal static class UpdateReviewEndpoint
{
    internal const string Name = "UpdateReview";

    internal static RouteHandlerBuilder MapUpdateReviewEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPut("/{id:guid}", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Updates an existing review.");

        static async Task<Results<Ok<ReviewDto>, NotFound, ValidationProblem>> Handle(
            Guid id,
            UpdateReviewBody body,
            ISender sender,
            IValidator<UpdateReviewRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new UpdateReviewRequest
            {
                Id = id,
                Title = body.Title,
                Kind = body.Kind,
                Version = body.Version,
                Status = body.Status,
                DueDate = body.DueDate,
                Assignee = body.Assignee,
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            try
            {
                var result = await sender.Send(request, cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (ReviewNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}

internal sealed record UpdateReviewBody
{
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public required string Status { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public string? Assignee { get; init; }
}
