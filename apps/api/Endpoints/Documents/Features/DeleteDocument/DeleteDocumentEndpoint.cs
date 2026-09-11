using Aegis.Api.Endpoints.Documents.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Documents.Features.DeleteDocument;

internal static class DeleteDocumentEndpoint
{
    internal const string Name = "DeleteDocument";

    internal static RouteHandlerBuilder MapDeleteDocumentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapDelete("/{id:guid}", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Deletes a document.")
            .RequireAuthorization();

        static async Task<Results<NoContent, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                await sender.Send(new DeleteDocumentRequest(id), cancellationToken);
                return TypedResults.NoContent();
            }
            catch (DocumentNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
