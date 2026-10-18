using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.RemoveGroupMember;

public sealed record RemoveGroupMemberRequest : IRequest<Result<GroupDto>>
{
    public Guid GroupId { get; init; }
    public Guid UserId { get; init; }
}
