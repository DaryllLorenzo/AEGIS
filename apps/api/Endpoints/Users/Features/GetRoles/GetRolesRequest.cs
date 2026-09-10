using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetRoles;

public sealed record GetRolesRequest : SieveRequest, IRequest<PaginatedList<RoleDto>>;
