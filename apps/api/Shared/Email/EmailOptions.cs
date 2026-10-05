using System.ComponentModel.DataAnnotations;

namespace Aegis.Api.Shared.Email;

public sealed class EmailOptions
{
    public const string SectionName = "Email:Smtp";

    /// <summary>SMTP host. Leave empty to log-and-skip sends (e.g. no SMTP configured).</summary>
    public string Host { get; init; } = "";

    public int Port { get; init; } = 25;

    [Required]
    public required string From { get; init; }

    public bool EnableSsl { get; init; }
}
