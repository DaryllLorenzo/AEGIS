using System.Security.Claims;

namespace Aegis.Api.Common.Authz;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Parses the NameIdentifier claim into a Guid. Returns null when the claim is
    /// absent or malformed, so callers can fail with Unauthorized instead of throwing.
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal? principal)
    {
        if (principal?.FindFirstValue(ClaimTypes.NameIdentifier) is { } value
            && Guid.TryParse(value, out var userId))
        {
            return userId;
        }

        return null;
    }
}
