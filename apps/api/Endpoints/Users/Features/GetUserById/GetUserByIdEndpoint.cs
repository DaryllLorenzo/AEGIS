using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetUserById;

internal static class GetUserByIdEndpoint
{
    internal const string Name = "GetUserById";

    internal static RouteHandlerBuilder MapGetUserByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a user by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<UserDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(new GetUserByIdRequest(id), cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (UserNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
