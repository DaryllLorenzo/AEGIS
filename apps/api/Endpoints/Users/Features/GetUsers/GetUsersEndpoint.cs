using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetUsers;

internal static class GetUsersEndpoint
{
    internal const string Name = "GetUsers";

    internal static RouteHandlerBuilder MapGetUsersEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a paginated list of users.")
            .RequireAuthorization();

        static async Task<Ok<PaginatedList<UserDto>>> Handle(
            [AsParameters] GetUsersParameters parameters,
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

            var result = await sender.Send(new GetUsersRequest { Sieve = sieve }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetUsersParameters
{
    public int? Page { get; init; }
    public int? PageSize { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
