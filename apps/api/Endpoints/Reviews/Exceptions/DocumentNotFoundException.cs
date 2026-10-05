namespace Aegis.Api.Endpoints.Reviews.Exceptions;

public sealed class DocumentNotFoundException : Exception
{
    public DocumentNotFoundException(Guid documentId)
        : base($"Document '{documentId}' was not found.")
    {
    }
}
