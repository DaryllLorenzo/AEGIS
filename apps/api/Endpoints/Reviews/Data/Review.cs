using Aegis.Api.Endpoints.Documents.Data;

namespace Aegis.Api.Endpoints.Reviews.Data;

public sealed class Review
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public required string Title { get; set; }
    public string? Kind { get; set; }
    public string? Version { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public string? Assignee { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public Document? Document { get; set; }
}
