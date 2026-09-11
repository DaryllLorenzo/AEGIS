using Aegis.Api.Endpoints.Roles.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Roles.Features.CreateRole;

public sealed record CreateRoleRequest : IRequest<RoleDto>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
