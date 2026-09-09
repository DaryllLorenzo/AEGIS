namespace Aegis.Api.Endpoints.Reviews.Dtos;

public sealed record ReviewDto
{
    public Guid Id { get; init; }
    public Guid DocumentId { get; init; }
    public required string Title { get; init; }
    public string? Kind { get; init; }
    public string? Version { get; init; }
    public required string Status { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public string? Assignee { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? UpdatedAt { get; init; }
}
