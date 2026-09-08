using System.ComponentModel.DataAnnotations;

namespace Aegis.Api.Storage.MinIO;

/// <summary>
/// Strongly-typed configuration for the MinIO storage provider.
/// Bound from the "Storage:MinIO" section in appsettings / environment variables.
/// </summary>
public sealed class MinIOOptions
{
    public const string SectionName = "Storage:MinIO";

    /// <summary>MinIO server endpoint, e.g. "localhost:9000".</summary>
    [Required]
    public required string Endpoint { get; init; }

    /// <summary>Access key (MINIO_ROOT_USER in development).</summary>
    [Required]
    public required string AccessKey { get; init; }

    /// <summary>Secret key (MINIO_ROOT_PASSWORD in development).</summary>
    [Required]
    public required string SecretKey { get; init; }

    /// <summary>
    /// Use HTTPS to connect to the server. Set to <see langword="false"/> for local
    /// development where MinIO runs without TLS.
    /// </summary>
    public bool UseSsl { get; init; } = false;

    /// <summary>
    /// How long presigned download URLs remain valid when no explicit expiry is given.
    /// Defaults to 1 hour.
    /// </summary>
    public TimeSpan DefaultPresignedUrlExpiry { get; init; } = TimeSpan.FromHours(1);
}
