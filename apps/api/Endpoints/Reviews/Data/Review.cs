using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Users.Data;

namespace Aegis.Api.Endpoints.Reviews.Data;

public sealed class Review
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid UserId { get; set; }
    public required string Title { get; set; }
    public string? Kind { get; set; }
    public string? Version { get; set; }
    public ReviewStatus Status { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    /// <summary>
    /// The reviewer assigned to this round. Must be a member of the
    /// document's group (enforced on create/update).
    /// </summary>
    public Guid? AssigneeId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public Document? Document { get; set; }
    public User? AssigneeUser { get; set; }
}
