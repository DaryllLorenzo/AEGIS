using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.GetRoles;

public sealed record GetRolesRequest : SieveRequest, IRequest<PaginatedList<RoleDto>>;
