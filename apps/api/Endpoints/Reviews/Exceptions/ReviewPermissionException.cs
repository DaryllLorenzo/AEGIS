namespace Aegis.Api.Endpoints.Reviews.Exceptions;

/// <summary>Raised when a user without the required role/transition rights tries to change a review.</summary>
public sealed class ReviewPermissionException : Exception
{
    public ReviewPermissionException(string message) : base(message)
    {
    }
}
