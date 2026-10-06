namespace Aegis.Api.Endpoints.Annotations.Exceptions;

/// <summary>Raised when someone without the Reviewer role in the document's group tries to write annotations.</summary>
public sealed class AnnotationsPermissionException : Exception
{
    public AnnotationsPermissionException(Guid documentId)
        : base($"Only Reviewers in this group can edit annotations for document '{documentId}'.")
    {
    }
}
