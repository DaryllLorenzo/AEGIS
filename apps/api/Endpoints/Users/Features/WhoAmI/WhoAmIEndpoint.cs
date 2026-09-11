using System.Security.Claims;
using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.WhoAmI;

internal static class WhoAmIEndpoint
{
    internal const string Name = "WhoAmI";

    internal static RouteHandlerBuilder MapWhoAmIEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/me", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns the currently authenticated user.")
            .RequireAuthorization();

        static Results<Ok<UserDto>, UnauthorizedHttpResult> Handle(
            ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim is null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return TypedResults.Unauthorized();
            }

            var dto = new UserDto
            {
                Id = userId,
                Email = user.FindFirst(ClaimTypes.Email)?.Value ?? "",
                DisplayName = user.FindFirst(ClaimTypes.Name)?.Value ?? "",
            };

            return TypedResults.Ok(dto);
        }
    }
}
