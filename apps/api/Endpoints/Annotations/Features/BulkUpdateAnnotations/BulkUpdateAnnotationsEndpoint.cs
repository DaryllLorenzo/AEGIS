using Aegis.Api.Endpoints.Annotations.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;

internal static class BulkUpdateAnnotationsEndpoint
{
    internal const string Name = "BulkUpdateAnnotations";

    internal static RouteHandlerBuilder MapBulkUpdateAnnotationsEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPut("/document/{documentId:guid}", Handle)
            .WithTags(AnnotationsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Replaces all annotations for a document. Send an empty array to clear.");

        static async Task<Results<Ok<List<AnnotationDto>>, ValidationProblem>> Handle(
            Guid documentId,
            BulkUpdateAnnotationsBody body,
            ISender sender,
            IValidator<BulkUpdateAnnotationsRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new BulkUpdateAnnotationsRequest
            {
                DocumentId = documentId,
                Annotations = body.Annotations?.Select(a => new AnnotationBulkItem
                {
                    Id = a.Id,
                    PageNumber = a.PageNumber,
                    Type = a.Type,
                    Geometry = a.Geometry,
                    Content = a.Content,
                    Color = a.Color,
                }).ToList() ?? [],
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record BulkUpdateAnnotationsBody
{
    public List<BulkAnnotationItemBody>? Annotations { get; init; }
}

internal sealed record BulkAnnotationItemBody
{
    public Guid? Id { get; init; }
    public int PageNumber { get; init; }
    public required string Type { get; init; }
    public required string Geometry { get; init; }
    public string? Content { get; init; }
    public string? Color { get; init; }
}
