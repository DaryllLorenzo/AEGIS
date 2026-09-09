namespace Aegis.Api.Endpoints.Annotations.Dtos;

public sealed record AnnotationDto
{
    public Guid Id { get; init; }
    public Guid DocumentId { get; init; }
    public int PageNumber { get; init; }
    public required string Type { get; init; }
    public required string Geometry { get; init; }
    public string? Content { get; init; }
    public string? Color { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
