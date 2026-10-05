using Aegis.Api.Endpoints.Reviews.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Reviews.Features.CreateReview;

internal static class CreateReviewEndpoint
{
    internal const string Name = "CreateReview";

    internal static RouteHandlerBuilder MapCreateReviewEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(ReviewsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Creates a new review for a document.")
            .RequireAuthorization();

        static async Task<Results<Created<ReviewDto>, ValidationProblem>> Handle(
            CreateReviewBody body,
            ISender sender,
            IValidator<CreateReviewRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new CreateReviewRequest
            {
                DocumentId = body.DocumentId,
                Title = body.Title,
                Kind = body.Kind,
                Version = body.Version,
                DueDate = body.DueDate,
                AssigneeId = body.AssigneeId,
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            try
            {
                var result = await sender.Send(request, cancellationToken);
                return TypedResults.Created(
                    $"/api/reviews/{result.Id}",
                    result);
            }
            catch (Reviews.Exceptions.DocumentNotFoundException ex)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["documentId"] = [ex.Message]
                });
            }
            catch (Reviews.Exceptions.InvalidAssigneeException ex)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["assigneeId"] = [ex.Message]
                });
            }
        }
    }
}

internal sealed record CreateReviewBody
{
    public Guid DocumentId { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public Guid? AssigneeId { get; init; }
}
