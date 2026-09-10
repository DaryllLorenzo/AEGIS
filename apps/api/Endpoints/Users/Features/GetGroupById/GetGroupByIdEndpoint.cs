using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetGroupById;

internal static class GetGroupByIdEndpoint
{
    internal const string Name = "GetGroupById";

    internal static RouteHandlerBuilder MapGetGroupByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a group by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<GroupDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(new GetGroupByIdRequest(id), cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (UserNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
