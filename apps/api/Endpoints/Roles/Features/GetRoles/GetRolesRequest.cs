using Aegis.Api.Endpoints.Roles.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoles;

public sealed record GetRolesRequest : SieveRequest, IRequest<PaginatedList<RoleDto>>;
