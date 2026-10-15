using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Aegis.Api.Tests.Fixtures;

// IHttpContextAccessor carrying a NameIdentifier claim, as the handlers expect.
public static class HttpContextFactory
{
    public static IHttpContextAccessor Create(Guid? userId)
    {
        var context = new DefaultHttpContext();
        if (userId.HasValue)
        {
            var identity = new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString())],
                authenticationType: "Test");
            context.User = new ClaimsPrincipal(identity);
        }

        return new HttpContextAccessor { HttpContext = context };
    }
}
