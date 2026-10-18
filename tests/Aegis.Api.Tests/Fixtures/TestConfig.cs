using Aegis.Api.Configuration;
using Microsoft.Extensions.Configuration;

namespace Aegis.Api.Tests.Fixtures;

// In-memory Jwt settings for JwtTokenService / RefreshTokenService.
public static class TestConfig
{
    public const string SigningKey = "unit-test-signing-key-0123456789abcdef0123456789abcdef";

    public static IConfiguration Create() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = SigningKey,
                ["Jwt:Issuer"] = "aegis-tests",
                ["Jwt:Audience"] = "aegis-tests",
                ["Jwt:ExpiresInHours"] = "1",
                ["Jwt:RefreshExpiresInDays"] = "7",
            })
            .Build();

    public static JwtOptions JwtOptions() => new()
    {
        Key = SigningKey,
        Issuer = "aegis-tests",
        Audience = "aegis-tests",
        ExpiresInHours = 1,
        RefreshExpiresInDays = 7,
    };
}
