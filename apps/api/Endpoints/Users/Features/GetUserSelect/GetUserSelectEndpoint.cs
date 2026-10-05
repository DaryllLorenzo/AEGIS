using Aegis.Api.Endpoints.Users.Features.GetUserSelect;
using Aegis.Api.Shared.Select;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetUserSelect;

internal static class GetUserSelectEndpoint
{
    internal const string Name = "GetUserSelect";

    internal static RouteHandlerBuilder MapGetUserSelectEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/select", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns { id, label } pairs for user pickers. Optional ?groupId= scopes to group members.")
            .RequireAuthorization();

        static async Task<Ok<List<SelectItemDto>>> Handle(
            [AsParameters] GetUserSelectParameters parameters,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(
                new GetUserSelectRequest { GroupId = parameters.GroupId },
                cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}

internal sealed record GetUserSelectParameters
{
    public Guid? GroupId { get; init; }
}
