namespace Aegis.Api.Endpoints.Groups.Data;

public sealed class Group
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid FacultyId { get; set; }
    public string? Description { get; set; }
    /// <summary>
    /// The user who created this group. They implicitly hold the
    /// "Creator" role and may additionally be a Submitter/Reviewer.
    /// Null for groups created before this column existed.
    /// </summary>
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
