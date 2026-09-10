using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.CreateUser;

public sealed record CreateUserRequest : IRequest<UserDto>
{
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public required string Password { get; init; }
}
