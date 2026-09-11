namespace Aegis.Api.Endpoints.Groups.Data;

public sealed class Group
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid FacultyId { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
