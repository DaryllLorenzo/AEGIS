namespace Aegis.Api.Endpoints.Reviews.Exceptions;

public sealed class InvalidAssigneeException : Exception
{
    public InvalidAssigneeException(Guid assigneeId, Guid groupId)
        : base($"User '{assigneeId}' is not a member of group '{groupId}' and cannot be assigned.")
    {
    }
}
