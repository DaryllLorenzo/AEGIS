namespace Aegis.Email;

public sealed class EmailOptions
{
    public const string SectionName = "Email:Smtp";

    /// <summary>SMTP host. Leave empty to log-and-skip sends (e.g. no SMTP configured).</summary>
    public string Host { get; init; } = "";

    public int Port { get; init; } = 25;

    /// <summary>From address. Only required when <see cref="Host"/> is configured.</summary>
    public required string From { get; init; }

    public bool EnableSsl { get; init; }
}
