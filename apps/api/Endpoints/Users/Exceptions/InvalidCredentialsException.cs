namespace Aegis.Api.Endpoints.Users.Exceptions;

public sealed class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException()
        : base("Invalid email or password.")
    {
    }
}
