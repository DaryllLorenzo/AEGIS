using Aegis.Api.Modules.Roles.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.CreateRole;

public sealed record CreateRoleRequest : IRequest<Result<RoleDto>>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
