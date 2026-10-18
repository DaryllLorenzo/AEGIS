using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Modules.Users.Services;
using Aegis.Api.Tests.Fixtures;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Aegis.Api.Tests.Modules.Users.Services;

public sealed class JwtTokenServiceTests
{
    private readonly JwtTokenService _service = new(Options.Create(TestConfig.JwtOptions()));

    [Fact]
    public void GenerateToken_CarriesUserClaims()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@aegis.dev",
            DisplayName = "Test User",
            PasswordHash = "hash",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var token = _service.GenerateToken(user, ["Submitter", "Reviewer"]);
        var principal = Validate(token);

        Assert.Equal(user.Id.ToString(), principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("user@aegis.dev", principal.FindFirstValue(ClaimTypes.Email));
        Assert.Equal("Test User", principal.FindFirstValue(ClaimTypes.Name));
        Assert.Contains(principal.FindAll(ClaimTypes.Role), c => c.Value == "Submitter");
        Assert.Contains(principal.FindAll(ClaimTypes.Role), c => c.Value == "Reviewer");
    }

    [Fact]
    public void GenerateToken_UsesConfiguredLifetime()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@aegis.dev",
            DisplayName = "Test User",
            PasswordHash = "hash",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(_service.GenerateToken(user, []));

        // TestConfig sets Jwt:ExpiresInHours = 1.
        var lifetime = jwt.ValidTo - DateTime.UtcNow;
        Assert.InRange(lifetime, TimeSpan.FromMinutes(55), TimeSpan.FromMinutes(65));
    }

    private static ClaimsPrincipal Validate(string token)
    {
        var parameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(TestConfig.Create()["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = "aegis-tests",
            ValidateAudience = true,
            ValidAudience = "aegis-tests",
            ValidateLifetime = false,
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role,
        };

        return new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
    }
}
