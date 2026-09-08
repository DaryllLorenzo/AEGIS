using System.Runtime.CompilerServices;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace Aegis.Api.Storage.MinIO;

/// <summary>
/// <see cref="IStorageService"/> implementation backed by MinIO (or any S3-compatible
/// endpoint). All MinIO SDK details are contained here; nothing outside this file
/// references the Minio package.
/// </summary>
public sealed class MinIOStorageService : IStorageService
{
    private readonly IMinioClient _client;
    private readonly MinIOOptions _options;
    private readonly ILogger<MinIOStorageService> _logger;

    public MinIOStorageService(
        IMinioClient client,
        IOptions<MinIOOptions> options,
        ILogger<MinIOStorageService> logger)
    {
        _client = client;
        _options = options.Value;
        _logger = logger;
    }

    // -------------------------------------------------------------------------
    // Bucket management
    // -------------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task EnsureBucketExistsAsync(
        string bucketName,
        CancellationToken cancellationToken = default)
    {
        var existsArgs = new BucketExistsArgs().WithBucket(bucketName);
        bool exists = await _client.BucketExistsAsync(existsArgs, cancellationToken);

        if (!exists)
        {
            _logger.LogInformation("Bucket '{Bucket}' not found — creating it.", bucketName);
            var makeArgs = new MakeBucketArgs().WithBucket(bucketName);
            await _client.MakeBucketAsync(makeArgs, cancellationToken);
        }
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task<StoredObject> UploadAsync(
        string bucketName,
        string objectKey,
        Stream stream,
        long fileSize,
        string mimeType,
        CancellationToken cancellationToken = default)
    {
        var putArgs = new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectKey)
            .WithStreamData(stream)
            .WithObjectSize(fileSize)
            .WithContentType(mimeType);

        var response = await _client.PutObjectAsync(putArgs, cancellationToken);

        _logger.LogInformation(
            "Uploaded object '{Key}' to bucket '{Bucket}' ({Size} bytes).",
            objectKey, bucketName, fileSize);

        return new StoredObject
        {
            BucketName = bucketName,
            ObjectKey = objectKey,
            FileSize = fileSize,
            MimeType = mimeType,
            // PutObjectResponse carries the ETag which we use as the checksum.
            Checksum = response.Etag,
            LastModified = DateTimeOffset.UtcNow
        };
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task<Stream> DownloadAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        var buffer = new MemoryStream();

        var getArgs = new GetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectKey)
            .WithCallbackStream((stream, ct) => stream.CopyToAsync(buffer, ct));

        await _client.GetObjectAsync(getArgs, cancellationToken);
        buffer.Position = 0;
        return buffer;
    }

    /// <inheritdoc/>
    public async Task<Uri> GetPresignedDownloadUrlAsync(
        string bucketName,
        string objectKey,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default)
    {
        int expirySeconds = (int)(expiry ?? _options.DefaultPresignedUrlExpiry).TotalSeconds;

        var presignArgs = new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectKey)
            .WithExpiry(expirySeconds);

        string url = await _client.PresignedGetObjectAsync(presignArgs);
        return new Uri(url);
    }

    /// <inheritdoc/>
    public async Task<StoredObject?> StatAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var statArgs = new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectKey);

            var stat = await _client.StatObjectAsync(statArgs, cancellationToken);

            return new StoredObject
            {
                BucketName = bucketName,
                ObjectKey = objectKey,
                FileSize = stat.Size,
                MimeType = stat.ContentType,
                Checksum = stat.ETag,
                LastModified = stat.LastModified != default
                    ? new DateTimeOffset(DateTime.SpecifyKind(stat.LastModified, DateTimeKind.Utc), TimeSpan.Zero)
                    : null
            };
        }
        catch (ObjectNotFoundException)
        {
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    /// <inheritdoc/>
    public async IAsyncEnumerable<StoredObject> ListAsync(
        string bucketName,
        string prefix = "",
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var listArgs = new ListObjectsArgs()
            .WithBucket(bucketName)
            .WithPrefix(prefix)
            .WithRecursive(true);

        await foreach (var item in _client.ListObjectsEnumAsync(listArgs, cancellationToken))
        {
            yield return new StoredObject
            {
                BucketName = bucketName,
                ObjectKey = item.Key,
                FileSize = (long)item.Size,
                MimeType = string.Empty,   // MinIO list responses do not include Content-Type.
                Checksum = item.ETag,
                LastModified = item.LastModifiedDateTime.HasValue
                    ? new DateTimeOffset(DateTime.SpecifyKind(item.LastModifiedDateTime.Value, DateTimeKind.Utc), TimeSpan.Zero)
                    : null
            };
        }
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task DeleteAsync(
        string bucketName,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        var removeArgs = new RemoveObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectKey);

        await _client.RemoveObjectAsync(removeArgs, cancellationToken);

        _logger.LogInformation(
            "Deleted object '{Key}' from bucket '{Bucket}'.", objectKey, bucketName);
    }

    /// <inheritdoc/>
    public async Task DeleteManyAsync(
        string bucketName,
        IEnumerable<string> objectKeys,
        CancellationToken cancellationToken = default)
    {
        var keyList = objectKeys.ToList();
        if (keyList.Count == 0)
        {
            return;
        }

        var removeArgs = new RemoveObjectsArgs()
            .WithBucket(bucketName)
            .WithObjects(keyList);

        // RemoveObjectsAsync returns the list of delete errors (objects that could not be removed).
        var deleteErrors = await _client.RemoveObjectsAsync(removeArgs, cancellationToken);

        var errors = new List<string>();
        foreach (var deleteError in deleteErrors)
        {
            errors.Add($"{deleteError.Key}: {deleteError.Message}");
            _logger.LogWarning(
                "Failed to delete '{Key}' from bucket '{Bucket}': {Error}",
                deleteError.Key, bucketName, deleteError.Message);
        }

        if (errors.Count > 0)
        {
            throw new InvalidOperationException(
                $"Some objects could not be deleted from '{bucketName}': {string.Join("; ", errors)}");
        }

        _logger.LogInformation(
            "Deleted {Count} object(s) from bucket '{Bucket}'.", keyList.Count, bucketName);
    }
}
