using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFaculties;

internal static class GetFacultiesEndpoint
{
    internal const string Name = "GetFaculties";

    internal static RouteHandlerBuilder MapGetFacultiesEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(FacultiesConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of faculties.")
            .WithDescription("Supports filtering, sorting and pagination via Sieve query parameters.");

        static async Task<Ok<PaginatedList<FacultyDto>>> Handle(
            [AsParameters] GetFacultiesParameters parameters,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var Sieve = new Sieve.Models.SieveModel
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                Filters = parameters.Filters,
                Sorts = parameters.Sorts,
            };

            var result = await sender.Send(new GetFacultiesRequest { Sieve = Sieve }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetFacultiesParameters
{
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
