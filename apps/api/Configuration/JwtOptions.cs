using System.ComponentModel.DataAnnotations;

namespace Aegis.Api.Configuration;

/// <summary>
/// JWT settings bound from the "Jwt" section. Validated at startup so a missing
/// or too-short signing key stops the app before it can issue weak tokens.
/// </summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required, MinLength(32)]
    public required string Key { get; init; }

    [Required]
    public required string Issuer { get; init; }

    [Required]
    public required string Audience { get; init; }

    public double ExpiresInHours { get; init; } = 24;

    public double RefreshExpiresInDays { get; init; } = 7;
}
