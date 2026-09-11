namespace Aegis.Api.Endpoints.Reviews.Exceptions;

public sealed class InvalidReviewTransitionException : Exception
{
    public InvalidReviewTransitionException(string from, string to)
        : base($"Cannot transition review from '{from}' to '{to}'.")
    {
    }
}
