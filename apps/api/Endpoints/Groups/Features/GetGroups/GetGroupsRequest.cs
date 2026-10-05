using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroups;

public sealed record GetGroupsRequest : SieveRequest, IRequest<PaginatedList<GroupDto>>
{
    /// <summary>When true, only groups the current user is a member of.</summary>
    public bool? Mine { get; init; }
}
