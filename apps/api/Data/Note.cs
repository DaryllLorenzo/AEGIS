namespace Aegis.Api.Data;

/// <summary>
/// Placeholder entity that proves the Web -> API -> PostgreSQL path end to end.
/// Replace it with the real AEGIS domain model.
/// </summary>
public class Note
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
