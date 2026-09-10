namespace Aegis.Api.Endpoints.Users.Exceptions;

public sealed class UserNotFoundException : Exception
{
    public UserNotFoundException(Guid id)
        : base($"User with ID '{id}' was not found.")
    {
    }
}
