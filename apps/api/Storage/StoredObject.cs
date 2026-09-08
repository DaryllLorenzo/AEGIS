namespace Aegis.Api.Storage;

/// <summary>
/// Metadata returned by the storage layer after an upload or a stat call.
/// Intentionally free of any provider-specific types so the rest of the application
/// never needs to reference MinIO (or any other SDK) directly.
/// </summary>
public sealed record StoredObject
{
    /// <summary>The bucket (or container) where the object lives.</summary>
    public required string BucketName { get; init; }

    /// <summary>
    /// The full key path inside the bucket, e.g. "documents/2026/thesis.pdf".
    /// Maps directly to the <c>objectKey</c> column in the Document table.
    /// </summary>
    public required string ObjectKey { get; init; }

    /// <summary>File size in bytes. Maps to the <c>fileSize</c> (Bigint) column.</summary>
    public required long FileSize { get; init; }

    /// <summary>MIME type reported by the caller and stored verbatim.</summary>
    public required string MimeType { get; init; }

    /// <summary>
    /// MD5 / ETag returned by the storage backend after the upload.
    /// Maps to the <c>checksum</c> column.
    /// </summary>
    public string? Checksum { get; init; }

    /// <summary>UTC timestamp of the last modification, if the provider returns one.</summary>
    public DateTimeOffset? LastModified { get; init; }
}
