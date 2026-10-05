namespace Aegis.Api.Endpoints.Documents.Data;

public sealed class Document
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public Guid? ParentId { get; set; }
    public int TotalPages { get; set; }
    public required string Name { get; set; }
    public DocumentType Type { get; set; }
    /// <summary>
    /// Auto-assigned, consecutive version number within the document's
    /// lineage: 1 for the root, parent.Version + 1 for new versions.
    /// Never user-editable.
    /// </summary>
    public int Version { get; set; }
    public required string ObjectKey { get; set; }
    public required string BucketName { get; set; }
    public long FileSize { get; set; }
    public required string MimeType { get; set; }
    public required string Checksum { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Document? Parent { get; set; }
    public List<Document> Children { get; set; } = [];
}
