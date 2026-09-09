using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using Aegis.Api.Shared.Storage;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

internal static class GetDocumentDownloadEndpoint
{
    internal const string Name = "DownloadDocument";

    internal static RouteHandlerBuilder MapGetDocumentDownloadEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}/download", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Streams the raw file for a document from object storage.");

        static async Task<Results<FileStreamHttpResult, NotFound>> Handle(
            Guid id,
            ISender sender,
            IStorageService storage,
            CancellationToken cancellationToken)
        {
            DocumentDto dto;
            try
            {
                dto = await sender.Send(new GetDocumentByIdRequest(id), cancellationToken);
            }
            catch (DocumentNotFoundException)
            {
                return TypedResults.NotFound();
            }

            var stream = await storage.DownloadAsync(dto.BucketName, dto.ObjectKey, cancellationToken);

            return TypedResults.File(
                stream,
                contentType: dto.MimeType,
                fileDownloadName: dto.Name,
                enableRangeProcessing: true);
        }
    }
}
