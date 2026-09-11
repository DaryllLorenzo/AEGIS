namespace Aegis.Api.Endpoints.Documents.Dtos;

public sealed record DocumentDto
{
    public Guid Id { get; init; }
    public Guid GroupId { get; init; }
    public Guid? ParentId { get; init; }
    public int TotalPages { get; init; }
    public required string Name { get; init; }
    public required string ObjectKey { get; init; }
    public required string BucketName { get; init; }
    public long FileSize { get; init; }
    public required string MimeType { get; init; }
    public required string Checksum { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
