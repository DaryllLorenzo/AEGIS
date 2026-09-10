using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.CreateRole;

public sealed record CreateRoleRequest : IRequest<RoleDto>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
