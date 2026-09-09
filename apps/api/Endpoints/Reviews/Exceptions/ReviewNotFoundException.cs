namespace Aegis.Api.Endpoints.Reviews.Exceptions;

public sealed class ReviewNotFoundException : Exception
{
    public ReviewNotFoundException(Guid id)
        : base($"Review with ID '{id}' was not found.")
    {
    }
}
