using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetRoleById;

internal static class GetRoleByIdEndpoint
{
    internal const string Name = "GetRoleById";

    internal static RouteHandlerBuilder MapGetRoleByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a role by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<RoleDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(new GetRoleByIdRequest(id), cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (UserNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
