namespace Aegis.Api.Endpoints.Documents.Exceptions;

public sealed class DocumentLockedException : Exception
{
    public DocumentLockedException(Guid id)
        : base($"Document with ID '{id}' has a completed review and cannot be modified.")
    {
    }
}
