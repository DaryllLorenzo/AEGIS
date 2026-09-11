namespace Aegis.Api.Endpoints.Documents.Exceptions;

public sealed class NotGroupMemberException : Exception
{
    public NotGroupMemberException(Guid groupId)
        : base($"User is not a member of group '{groupId}'.")
    {
    }
}
