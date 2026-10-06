namespace Aegis.Api.Endpoints.Users.Data;

public sealed class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required string PasswordHash { get; set; }
    public bool IsActive { get; set; } = true;
    /// <summary>Global admin flag: bypasses group-level role gating for user/faculty CRUD.</summary>
    public bool IsAdmin { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
