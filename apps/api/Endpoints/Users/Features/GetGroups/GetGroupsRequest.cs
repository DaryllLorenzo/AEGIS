using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetGroups;

public sealed record GetGroupsRequest : SieveRequest, IRequest<PaginatedList<GroupDto>>;
