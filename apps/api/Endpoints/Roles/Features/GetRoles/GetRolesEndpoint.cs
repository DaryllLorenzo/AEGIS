using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoles;

internal static class GetRolesEndpoint
{
    internal const string Name = "GetRoles";

    internal static RouteHandlerBuilder MapGetRolesEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(RolesConfigurations.RolesTag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of roles.")
            .RequireAuthorization();

        static async Task<Ok<PaginatedList<RoleDto>>> Handle(
            [AsParameters] GetRolesParameters parameters,
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

            var result = await sender.Send(new GetRolesRequest { Sieve = sieve }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetRolesParameters
{
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
