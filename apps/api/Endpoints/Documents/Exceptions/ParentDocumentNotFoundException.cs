namespace Aegis.Api.Endpoints.Documents.Exceptions;

public sealed class ParentDocumentNotFoundException : Exception
{
    public ParentDocumentNotFoundException(Guid parentId)
        : base($"Parent document '{parentId}' was not found in this group.")
    {
    }
}
