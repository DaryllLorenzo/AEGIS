using System.ComponentModel.DataAnnotations;

namespace Aegis.Api.Shared.Storage.MinIO;

public sealed class MinIOOptions
{
    public const string SectionName = "Storage:MinIO";

    [Required]
    public required string Endpoint { get; init; }

    [Required]
    public required string AccessKey { get; init; }

    [Required]
    public required string SecretKey { get; init; }

    public bool UseSsl { get; init; } = false;

    public TimeSpan DefaultPresignedUrlExpiry { get; init; } = TimeSpan.FromHours(1);
}
