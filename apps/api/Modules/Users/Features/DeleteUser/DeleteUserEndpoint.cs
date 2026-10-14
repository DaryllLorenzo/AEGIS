using Aegis.Api.Common.Authz;
using Aegis.Api.Common.Results;
using Aegis.Common.Result;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Users.Features.DeleteUser;

internal static class DeleteUserEndpoint
{
    internal const string Name = "DeleteUser";

    internal static RouteHandlerBuilder MapDeleteUserEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapDelete("/{id:guid}", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Deletes a user.")
            .RequireAuthorization()
            .RequireAdmin();

        static async Task<Results<NoContent, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new DeleteUserRequest(id), cancellationToken);
            return result.ToNoContentOrNotFound();
        }
    }
}
