using Aegis.Api.Endpoints.Documents.Data;

namespace Aegis.Api.Endpoints.Annotations.Data;

public sealed class Annotation
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public int PageNumber { get; set; }
    public required string Type { get; set; }
    public required string Geometry { get; set; }
    public string? Content { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public Document? Document { get; set; }
}
