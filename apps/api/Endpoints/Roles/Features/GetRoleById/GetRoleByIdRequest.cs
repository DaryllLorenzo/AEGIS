using Aegis.Api.Endpoints.Roles.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Roles.Features.GetRoleById;

public sealed record GetRoleByIdRequest(Guid Id) : IRequest<RoleDto>;
