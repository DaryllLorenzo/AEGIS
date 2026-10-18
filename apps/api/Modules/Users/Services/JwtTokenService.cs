using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aegis.Api.Configuration;
using Aegis.Api.Modules.Users.Data;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Aegis.Api.Modules.Users.Services;

public sealed class JwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>Access-token lifetime, so callers report the same expiry the token carries.</summary>
    public TimeSpan AccessTokenLifetime => TimeSpan.FromHours(_options.ExpiresInHours);

    public string GenerateToken(User user, IEnumerable<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var expires = DateTime.UtcNow.Add(AccessTokenLifetime);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
