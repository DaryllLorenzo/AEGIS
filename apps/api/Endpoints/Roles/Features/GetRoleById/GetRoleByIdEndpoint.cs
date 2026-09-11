using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Endpoints.Roles.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoleById;

internal static class GetRoleByIdEndpoint
{
    internal const string Name = "GetRoleById";

    internal static RouteHandlerBuilder MapGetRoleByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(RolesConfigurations.RolesTag)
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
            catch (RoleNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
