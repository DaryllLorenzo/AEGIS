namespace Aegis.Api.Storage;

/// <summary>
/// Provider-agnostic contract for binary object storage.
///
/// Implementations hide the underlying SDK (MinIO, S3, Azure Blob, …) behind this
/// interface so that the rest of the application never imports a provider-specific
/// package. Swap the registration in Program.cs and only the Infrastructure layer changes.
///
/// All operations are async and accept a <see cref="CancellationToken"/> so they compose
/// cleanly with ASP.NET Core's request cancellation.
/// </summary>
public interface IStorageService
{
    // -------------------------------------------------------------------------
    // Bucket management
    // -------------------------------------------------------------------------

    /// <summary>
    /// Ensures the bucket exists. Creates it if it does not. Safe to call on every
    /// startup — implementations must be idempotent.
    /// </summary>
    Task EnsureBucketExistsAsync(string bucketName, CancellationToken cancellationToken = default);

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /// <summary>
    /// Uploads a stream as a new object (or replaces it if the key already exists).
    /// </summary>
    /// <param name="bucketName">Target bucket.</param>
    /// <param name="objectKey">Full key path inside the bucket, e.g. "documents/2026/thesis.pdf".</param>
    /// <param name="stream">Readable stream. The caller owns it and must dispose it.</param>
    /// <param name="fileSize">
    /// Stream length in bytes. Pass -1 if unknown; the implementation will try to
    /// determine it, but some providers require the size upfront.
    /// </param>
    /// <param name="mimeType">Content-Type of the object, e.g. "application/pdf".</param>
    /// <param name="cancellationToken"/>
    /// <returns>Metadata of the uploaded object, including the checksum assigned by the provider.</returns>
    Task<StoredObject> UploadAsync(
        string bucketName,
        string objectKey,
        Stream stream,
        long fileSize,
        string mimeType,
        CancellationToken cancellationToken = default);

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /// <summary>
    /// Opens a readable stream for the object identified by <paramref name="objectKey"/>.
    /// The caller is responsible for disposing the returned stream.
    /// </summary>
    Task<Stream> DownloadAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a time-limited pre-signed URL that allows a browser (or any HTTP client)
    /// to download the object directly from the storage backend without routing through
    /// the API server.
    /// </summary>
    /// <param name="expiry">How long the URL should remain valid. Defaults to 1 hour.</param>
    Task<Uri> GetPresignedDownloadUrlAsync(
        string bucketName,
        string objectKey,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns metadata for a single object without downloading its content.
    /// Returns <see langword="null"/> if the object does not exist.
    /// </summary>
    Task<StoredObject?> StatAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    /// <summary>
    /// Lists objects whose key starts with <paramref name="prefix"/>.
    /// Pass an empty string to list all objects in the bucket.
    /// </summary>
    IAsyncEnumerable<StoredObject> ListAsync(
        string bucketName,
        string prefix = "",
        CancellationToken cancellationToken = default);

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    /// <summary>
    /// Permanently deletes a single object.
    /// Does nothing if the object does not exist (idempotent).
    /// </summary>
    Task DeleteAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Permanently deletes multiple objects in a single request where the provider
    /// supports bulk deletes, falling back to sequential deletes otherwise.
    /// </summary>
    Task DeleteManyAsync(
        string bucketName,
        IEnumerable<string> objectKeys,
        CancellationToken cancellationToken = default);
}
