using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.GetProtectedResource;

internal static class GetProtectedResourceEndpoint
{
    internal const string Name = "GetProtectedResource";

    internal static RouteHandlerBuilder MapGetProtectedResourceEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/protected", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Test endpoint that requires authentication.")
            .RequireAuthorization();

        static Results<Ok<object>, UnauthorizedHttpResult> Handle(
            HttpContext httpContext)
        {
            var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var role = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            return TypedResults.Ok<object>(new
            {
                Message = "You are authenticated!",
                UserId = userId,
                Email = email,
                DisplayName = name,
                Role = role,
            });
        }
    }
}
