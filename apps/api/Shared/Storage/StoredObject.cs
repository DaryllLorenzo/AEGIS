namespace Aegis.Api.Shared.Storage;

public sealed record StoredObject
{
    public required string BucketName { get; init; }
    public required string ObjectKey { get; init; }
    public required long FileSize { get; init; }
    public required string MimeType { get; init; }
    public string? Checksum { get; init; }
    public DateTimeOffset? LastModified { get; init; }
}
