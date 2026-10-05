namespace Aegis.Api.Endpoints.Documents.Data;

/// <summary>
/// The kind of research object a document represents. Stored as an int
/// (like ReviewStatus) so the frontend receives a stable, closed set.
/// </summary>
public enum DocumentType
{
    Thesis = 0,
    Article = 1,
}
