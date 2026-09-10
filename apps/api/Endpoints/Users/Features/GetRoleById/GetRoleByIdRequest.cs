using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetRoleById;

public sealed record GetRoleByIdRequest(Guid Id) : IRequest<RoleDto>;
