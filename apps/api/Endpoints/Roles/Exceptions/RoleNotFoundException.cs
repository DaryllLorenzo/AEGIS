namespace Aegis.Api.Endpoints.Roles.Exceptions;

public sealed class RoleNotFoundException : Exception
{
    public RoleNotFoundException(Guid id)
        : base($"Role with ID '{id}' was not found.")
    {
    }
}
