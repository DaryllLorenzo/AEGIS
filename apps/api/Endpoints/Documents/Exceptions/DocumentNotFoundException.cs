namespace Aegis.Api.Endpoints.Documents.Exceptions;

public sealed class DocumentNotFoundException : Exception
{
    public DocumentNotFoundException(Guid id)
        : base($"Document with ID '{id}' was not found.")
    {
    }
}
