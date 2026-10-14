using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.GetGroups;

public sealed record GetGroupsRequest : SieveRequest, IRequest<PaginatedList<GroupDto>>
{
    /// <summary>When true, only groups the current user is a member of.</summary>
    public bool? Mine { get; init; }
}
