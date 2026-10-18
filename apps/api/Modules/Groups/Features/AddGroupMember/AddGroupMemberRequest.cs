using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.AddGroupMember;

public sealed record AddGroupMemberRequest : IRequest<Result<GroupDto>>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }

    /// <summary>"Submitter" or "Reviewer". Defaults to "Submitter" when omitted.</summary>
    public string? Role { get; init; }
}
