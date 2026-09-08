namespace Aegis.Api.Shared.Storage;

public interface IStorageService
{
    Task EnsureBucketExistsAsync(string bucketName, CancellationToken cancellationToken = default);

    Task<StoredObject> UploadAsync(
        string bucketName,
        string objectKey,
        Stream stream,
        long fileSize,
        string mimeType,
        CancellationToken cancellationToken = default);

    Task<Stream> DownloadAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    Task<Uri> GetPresignedDownloadUrlAsync(
        string bucketName,
        string objectKey,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default);

    Task<StoredObject?> StatAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    IAsyncEnumerable<StoredObject> ListAsync(
        string bucketName,
        string prefix = "",
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default);

    Task DeleteManyAsync(
        string bucketName,
        IEnumerable<string> objectKeys,
        CancellationToken cancellationToken = default);
}
