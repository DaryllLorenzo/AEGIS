using System.Runtime.CompilerServices;
using Aegis.Storage;

namespace Aegis.Api.Tests.Fixtures;

// In-memory IStorageService: no MinIO, records what was uploaded.
public sealed class FakeStorageService : IStorageService
{
    public List<(string Bucket, string Key, long Size)> Uploads { get; } = [];

    public Task EnsureBucketExistsAsync(string bucketName, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public Task<StoredObject> UploadAsync(
        string bucketName,
        string objectKey,
        Stream stream,
        long fileSize,
        string mimeType,
        CancellationToken cancellationToken = default)
    {
        Uploads.Add((bucketName, objectKey, fileSize));
        return Task.FromResult(
            new StoredObject
            {
                BucketName = bucketName,
                ObjectKey = objectKey,
                FileSize = fileSize,
                MimeType = mimeType,
                Checksum = "test-checksum",
            });
    }

    public Task<Stream> DownloadAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default) =>
        Task.FromResult<Stream>(new MemoryStream());

    public Task<StoredObject?> StatAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default) =>
        Task.FromResult<StoredObject?>(null);

    public async IAsyncEnumerable<StoredObject> ListAsync(
        string bucketName,
        string prefix = "",
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        yield break;
    }

    public Task DeleteAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public Task DeleteManyAsync(
        string bucketName,
        IEnumerable<string> objectKeys,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
