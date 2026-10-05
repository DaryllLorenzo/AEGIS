namespace Aegis.Api.Shared.Select;

/// <summary>
/// The shared shape for entity pickers (dropdowns, autocomplete).
///
/// Pattern: every entity that needs to be chosen in the UI exposes
///   GET /api/{entity}/select
/// returning a flat List&lt;SelectItemDto&gt; of { id, label } — no
/// pagination, no extra fields. Optional query parameters (e.g.
/// ?groupId=...) scope the result set. Add new entities by copying
/// the GetUserSelect feature and swapping the query.
/// </summary>
public sealed record SelectItemDto
{
    public Guid Id { get; init; }
    public required string Label { get; init; }
}
