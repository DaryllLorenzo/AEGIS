using Aegis.Api.Modules.Groups.Dtos;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.GetGroupMembers;

public sealed record GetGroupMembersRequest : IRequest<List<GroupMemberDto>>
{
    public Guid GroupId { get; init; }
}
