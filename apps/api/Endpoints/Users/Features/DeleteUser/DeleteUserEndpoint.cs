using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.DeleteUser;

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
            .RequireAuthorization();

        static async Task<Results<NoContent, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                await sender.Send(new DeleteUserRequest(id), cancellationToken);
                return TypedResults.NoContent();
            }
            catch (UserNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
