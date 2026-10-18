namespace Aegis.Storage.MinIO;

public sealed class MinIOOptions
{
    public const string SectionName = "Storage:MinIO";

    public required string Endpoint { get; init; }

    public required string AccessKey { get; init; }

    public required string SecretKey { get; init; }

    public bool UseSsl { get; init; }

    public TimeSpan DefaultPresignedUrlExpiry { get; init; } = TimeSpan.FromHours(1);
}
