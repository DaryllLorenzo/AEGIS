namespace Aegis.Api.Endpoints.Faculties.Exceptions;

public sealed class FacultyNotFoundException : Exception
{
    public FacultyNotFoundException(Guid id)
        : base($"Faculty with ID '{id}' was not found.")
    {
    }
}
