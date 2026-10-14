using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Reviews.Features.UpdateReview;

internal static class UpdateReviewEndpoint
{
    internal const string Name = "UpdateReview";

    internal static RouteHandlerBuilder MapUpdateReviewEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPut("/{id:guid}", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Updates an existing review.")
            .RequireAuthorization();

        static async Task<Results<Ok<ReviewDto>, NotFound, ValidationProblem, ProblemHttpResult>> Handle(
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
                AssigneeId = body.AssigneeId,
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);
            return result.ToOkNotFoundValidationOrForbidden();
        }
    }
}

internal sealed record UpdateReviewBody
{
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public ReviewStatus Status { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public Guid? AssigneeId { get; init; }
}
