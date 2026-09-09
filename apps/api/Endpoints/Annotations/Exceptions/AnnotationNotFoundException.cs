namespace Aegis.Api.Endpoints.Annotations.Exceptions;

public sealed class AnnotationNotFoundException : Exception
{
    public AnnotationNotFoundException(Guid id)
        : base($"Annotation with ID '{id}' was not found.")
    {
    }
}
