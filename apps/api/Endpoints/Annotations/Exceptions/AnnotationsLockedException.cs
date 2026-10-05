namespace Aegis.Api.Endpoints.Annotations.Exceptions;

public sealed class AnnotationsLockedException : Exception
{
    public AnnotationsLockedException(Guid documentId)
        : base($"Annotations for document '{documentId}' can only be edited while a review of that document is in progress.")
    {
    }
}
