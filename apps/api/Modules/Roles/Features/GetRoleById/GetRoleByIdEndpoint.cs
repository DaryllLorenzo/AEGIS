using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Roles.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Roles.Features.GetRoleById;

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
            var result = await sender.Send(new GetRoleByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
