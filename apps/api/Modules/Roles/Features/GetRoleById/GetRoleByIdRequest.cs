using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.GetRoleById;

public sealed record GetRoleByIdRequest(Guid Id) : IRequest<Result<RoleDto>>;
