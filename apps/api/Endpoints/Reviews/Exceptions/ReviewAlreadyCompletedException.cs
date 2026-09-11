namespace Aegis.Api.Endpoints.Reviews.Exceptions;

public sealed class ReviewAlreadyCompletedException : Exception
{
    public ReviewAlreadyCompletedException(Guid id)
        : base($"Review with ID '{id}' is completed and cannot be modified.")
    {
    }
}
