using Aegis.Api.Shared.Storage;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Endpoints;

/// <summary>
/// Temporary endpoints for exercising the MinIO storage layer end-to-end.
/// Tag: "Test.MinIO" — visible in Scalar / OpenAPI.
/// Remove or gate behind a feature flag before going to production.
/// </summary>
public static class MinIOTestEndpoints
{
    private const string BucketName = "aegis-test";
    private const string Tag = "Test.MinIO";

    public static IEndpointRouteBuilder MapMinIOTestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/test/minio").WithTags(Tag);

        // POST /api/test/minio/upload
        // Accepts a single PDF file via multipart/form-data.
        // Returns the stored object metadata on success.
        group.MapPost("/upload", UploadAsync)
            .WithName("TestMinIO.Upload")
            .WithSummary("Upload a PDF to MinIO")
            .WithDescription(
                "Uploads a PDF file to the 'aegis-test' bucket. " +
                "Creates the bucket if it does not exist. " +
                "The object key is: {prefix}/{timestamp}_{filename}.")
            .DisableAntiforgery();  // Required for multipart in Minimal APIs.

        // GET /api/test/minio/files
        // Lists all objects in the test bucket under a given prefix.
        group.MapGet("/files", ListAsync)
            .WithName("TestMinIO.List")
            .WithSummary("List objects in the test bucket")
            .WithDescription("Lists all objects under the given prefix inside 'aegis-test'.");

        // GET /api/test/minio/download/{*objectKey}
        // Returns a pre-signed URL valid for 1 hour.
        group.MapGet("/download/{*objectKey}", GetDownloadUrlAsync)
            .WithName("TestMinIO.PresignedUrl")
            .WithSummary("Get a presigned download URL")
            .WithDescription("Returns a time-limited presigned URL to download the object directly from MinIO.");

        // GET /api/test/minio/stat/{*objectKey}
        // Returns metadata for one object without downloading it.
        group.MapGet("/stat/{*objectKey}", StatAsync)
            .WithName("TestMinIO.Stat")
            .WithSummary("Stat an object")
            .WithDescription("Returns size, MIME type and checksum for the given object. 404 if it does not exist.");

        // DELETE /api/test/minio/{*objectKey}
        // Permanently deletes a single object.
        group.MapDelete("/{*objectKey}", DeleteAsync)
            .WithName("TestMinIO.Delete")
            .WithSummary("Delete an object")
            .WithDescription("Permanently deletes the object from the 'aegis-test' bucket.");

        return app;
    }

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    private static async Task<IResult> UploadAsync(
        IFormFile file,
        IStorageService storage,
        CancellationToken cancellationToken,
        [FromQuery] string prefix = "uploads")
    {
        // Only accept PDFs.
        if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
            && !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["file"] = ["Only PDF files are accepted."]
            });
        }

        if (file.Length == 0)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["file"] = ["File is empty."]
            });
        }

        // Build a key that avoids collisions: prefix/timestamp_filename
        var safeFileName = Path.GetFileName(file.FileName); // strip any path injected by the client
        var objectKey = $"{prefix.Trim('/')}/{DateTimeOffset.UtcNow:yyyyMMddHHmmss}_{safeFileName}";

        await storage.EnsureBucketExistsAsync(BucketName, cancellationToken);

        await using var stream = file.OpenReadStream();
        var stored = await storage.UploadAsync(
            bucketName: BucketName,
            objectKey: objectKey,
            stream: stream,
            fileSize: file.Length,
            mimeType: "application/pdf",
            cancellationToken: cancellationToken);

        return Results.Created($"/api/test/minio/stat/{objectKey}", new
        {
            stored.BucketName,
            stored.ObjectKey,
            stored.FileSize,
            stored.MimeType,
            stored.Checksum,
            stored.LastModified,
            StatUrl = $"/api/test/minio/stat/{objectKey}",
            PresignedUrlEndpoint = $"/api/test/minio/download/{objectKey}"
        });
    }

    private static async Task<IResult> ListAsync(
        IStorageService storage,
        CancellationToken cancellationToken,
        [FromQuery] string prefix = "")
    {
        await storage.EnsureBucketExistsAsync(BucketName, cancellationToken);

        var objects = new List<object>();

        await foreach (var obj in storage.ListAsync(BucketName, prefix, cancellationToken))
        {
            objects.Add(new
            {
                obj.ObjectKey,
                obj.FileSize,
                obj.Checksum,
                obj.LastModified
            });
        }

        return Results.Ok(new { BucketName, Prefix = prefix, Count = objects.Count, Objects = objects });
    }

    private static async Task<IResult> GetDownloadUrlAsync(
        string objectKey,
        IStorageService storage,
        CancellationToken cancellationToken)
    {
        // URL-decode the objectKey in case the client encoded slashes.
        objectKey = Uri.UnescapeDataString(objectKey);

        // Verify the object exists before issuing a URL.
        var stat = await storage.StatAsync(BucketName, objectKey, cancellationToken);
        if (stat is null)
        {
            return Results.NotFound(new { Message = $"Object '{objectKey}' not found in bucket '{BucketName}'." });
        }

        var url = await storage.GetPresignedDownloadUrlAsync(
            BucketName, objectKey, expiry: TimeSpan.FromHours(1), cancellationToken);

        return Results.Ok(new
        {
            ObjectKey = objectKey,
            Url = url.ToString(),
            ExpiresIn = "1 hour"
        });
    }

    private static async Task<IResult> StatAsync(
        string objectKey,
        IStorageService storage,
        CancellationToken cancellationToken)
    {
        // URL-decode the objectKey in case the client encoded slashes.
        objectKey = Uri.UnescapeDataString(objectKey);

        var stat = await storage.StatAsync(BucketName, objectKey, cancellationToken);

        if (stat is null)
        {
            return Results.NotFound(new { Message = $"Object '{objectKey}' not found in bucket '{BucketName}'." });
        }

        return Results.Ok(stat);
    }

    private static async Task<IResult> DeleteAsync(
        string objectKey,
        IStorageService storage,
        CancellationToken cancellationToken)
    {
        // URL-decode the objectKey in case the client encoded slashes.
        objectKey = Uri.UnescapeDataString(objectKey);

        // Stat first so we return 404 instead of silently doing nothing.
        var stat = await storage.StatAsync(BucketName, objectKey, cancellationToken);
        if (stat is null)
        {
            return Results.NotFound(new { Message = $"Object '{objectKey}' not found in bucket '{BucketName}'." });
        }

        await storage.DeleteAsync(BucketName, objectKey, cancellationToken);

        return Results.Ok(new { Message = $"Object '{objectKey}' deleted from bucket '{BucketName}'." });
    }
}
