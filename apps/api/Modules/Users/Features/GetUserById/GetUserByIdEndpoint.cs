using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Users.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Users.Features.GetUserById;

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
            var result = await sender.Send(new GetUserByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
