using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Documents.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Documents.Features.GetDocumentById;

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
            var result = await sender.Send(new GetDocumentByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
