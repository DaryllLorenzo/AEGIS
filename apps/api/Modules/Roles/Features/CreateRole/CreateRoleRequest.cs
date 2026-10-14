using Aegis.Api.Modules.Roles.Dtos;
using MediatR;

namespace Aegis.Api.Modules.Roles.Features.CreateRole;

public sealed record CreateRoleRequest : IRequest<RoleDto>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
