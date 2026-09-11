namespace Aegis.Api.Endpoints.Groups.Exceptions;

public sealed class GroupNotFoundException : Exception
{
    public GroupNotFoundException(Guid id)
        : base($"Group with ID '{id}' was not found.")
    {
    }
}
