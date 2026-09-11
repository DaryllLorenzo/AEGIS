using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

internal static class GetDocumentsEndpoint
{
    internal const string Name = "GetDocuments";

    internal static RouteHandlerBuilder MapGetDocumentsEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of documents.")
            .WithDescription("Supports filtering, sorting and pagination via Sieve query parameters.")
            .RequireAuthorization();

        static async Task<Ok<PaginatedList<DocumentDto>>> Handle(
            [AsParameters] GetDocumentsParameters parameters,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var sieve = new Sieve.Models.SieveModel
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                Filters = parameters.Filters,
                Sorts = parameters.Sorts,
            };

            var result = await sender.Send(new GetDocumentsRequest
            {
                Sieve = sieve,
                GroupId = parameters.GroupId,
            }, cancellationToken);

            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetDocumentsParameters
{
    public Guid? GroupId { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
