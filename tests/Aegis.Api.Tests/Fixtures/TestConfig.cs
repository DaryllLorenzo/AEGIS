using Microsoft.Extensions.Configuration;

namespace Aegis.Api.Tests.Fixtures;

// In-memory Jwt settings for JwtTokenService / RefreshTokenService.
public static class TestConfig
{
    public static IConfiguration Create() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "unit-test-signing-key-0123456789abcdef0123456789abcdef",
                ["Jwt:Issuer"] = "aegis-tests",
                ["Jwt:Audience"] = "aegis-tests",
                ["Jwt:ExpiresInHours"] = "1",
                ["Jwt:RefreshExpiresInDays"] = "7",
            })
            .Build();
}
