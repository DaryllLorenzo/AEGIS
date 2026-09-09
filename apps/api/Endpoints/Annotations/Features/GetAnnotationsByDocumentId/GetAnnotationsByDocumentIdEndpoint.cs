using Aegis.Api.Endpoints.Annotations.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Annotations.Features.GetAnnotationsByDocumentId;

internal static class GetAnnotationsByDocumentIdEndpoint
{
    internal const string Name = "GetAnnotationsByDocumentId";

    internal static RouteHandlerBuilder MapGetAnnotationsByDocumentIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/document/{documentId:guid}", Handle)
            .WithTags(AnnotationsConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns all active annotations for a document.");

        static async Task<Ok<List<AnnotationDto>>> Handle(
            Guid documentId,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new GetAnnotationsByDocumentIdRequest(documentId), cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}
