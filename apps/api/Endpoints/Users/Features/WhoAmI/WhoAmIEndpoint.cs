using System.Security.Claims;
using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

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

        static async Task<Results<Ok<UserDto>, UnauthorizedHttpResult>> Handle(
            ClaimsPrincipal user,
            Aegis.Api.Data.AegisDbContext db,
            CancellationToken ct)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim is null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return TypedResults.Unauthorized();
            }

            // Resolve from the DB so the live IsAdmin flag flows to the client
            // (the JWT claims alone may carry stale role state).
            var dbUser = await db.Users.FindAsync([userId], ct);
            if (dbUser is null) return TypedResults.Unauthorized();

            return TypedResults.Ok(new UserDto
            {
                Id = dbUser.Id,
                Email = dbUser.Email,
                DisplayName = dbUser.DisplayName,
                IsActive = dbUser.IsActive,
                IsAdmin = dbUser.IsAdmin,
            });
        }
    }
}
