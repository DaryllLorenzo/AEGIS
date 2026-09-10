using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.CreateGroup;

public sealed record CreateGroupRequest : IRequest<GroupDto>
{
    public required string Name { get; init; }
    public Guid FacultyId { get; init; }
    public string? Description { get; init; }
}
