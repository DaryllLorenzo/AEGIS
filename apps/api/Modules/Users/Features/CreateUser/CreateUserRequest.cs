using Aegis.Api.Modules.Users.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.CreateUser;

public sealed record CreateUserRequest : IRequest<Result<UserDto>>
{
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public required string Password { get; init; }
}
