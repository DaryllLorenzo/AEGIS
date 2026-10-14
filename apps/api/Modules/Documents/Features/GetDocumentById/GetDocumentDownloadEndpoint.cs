using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Storage;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Documents.Features.GetDocumentById;

internal static class GetDocumentDownloadEndpoint
{
    internal const string Name = "DownloadDocument";

    internal static RouteHandlerBuilder MapGetDocumentDownloadEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}/download", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Streams the raw file for a document from object storage.")
            .RequireAuthorization();

        static async Task<Results<FileStreamHttpResult, NotFound>> Handle(
            Guid id,
            ISender sender,
            IStorageService storage,
            CancellationToken cancellationToken)
        {
            var lookup = await sender.Send(new GetDocumentByIdRequest(id), cancellationToken);

            if (lookup.IsFailure)
            {
                return lookup.ToNotFound();
            }

            var dto = lookup.Value;
            var stream = await storage.DownloadAsync(dto.BucketName, dto.ObjectKey, cancellationToken);

            return TypedResults.File(
                stream,
                contentType: dto.MimeType,
                fileDownloadName: dto.Name,
                enableRangeProcessing: true);
        }
    }
}
