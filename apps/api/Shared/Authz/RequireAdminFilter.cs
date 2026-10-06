using System.Security.Claims;
using Aegis.Api.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Aegis.Api.Shared.Authz;

public static class RequireAdminFilter
{
    /// <summary>
    /// Endpoint filter enforcing the global admin flag (User.IsAdmin).
    /// Admins bypass the per-group role gating used across groups/documents,
    /// reviews and annotations.
    /// </summary>
    public static RouteHandlerBuilder RequireAdmin(this RouteHandlerBuilder builder)
    {
        return builder.AddEndpointFilter(async (context, next) =>
        {
            var principal = context.HttpContext.User;
            if (principal.Identity?.IsAuthenticated != true)
            {
                return TypedResults.Unauthorized();
            }

            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim is null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return TypedResults.Unauthorized();
            }

            var db = context.HttpContext.RequestServices
                .GetRequiredService<AegisDbContext>();

            var isAdmin = await db.Users
                .Where(u => u.Id == userId)
                .Select(u => u.IsAdmin)
                .FirstOrDefaultAsync(context.HttpContext.RequestAborted);

            if (!isAdmin)
            {
                return TypedResults.Problem(statusCode: 403, detail: "Admin role required.");
            }

            return await next(context);
        });
    }
}
