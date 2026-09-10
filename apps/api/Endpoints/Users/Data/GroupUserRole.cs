namespace Aegis.Api.Endpoints.Users.Data;

public sealed class GroupUserRole
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GroupId { get; set; }
    public Guid RoleId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
}
