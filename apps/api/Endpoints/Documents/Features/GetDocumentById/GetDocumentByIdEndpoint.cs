using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

internal static class GetDocumentByIdEndpoint
{
    internal const string Name = "GetDocumentById";

    internal static RouteHandlerBuilder MapGetDocumentByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Returns a document by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<DocumentDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(new GetDocumentByIdRequest(id), cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (DocumentNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
