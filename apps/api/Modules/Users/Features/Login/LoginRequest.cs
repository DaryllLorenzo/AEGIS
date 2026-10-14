using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.Login;

public sealed record LoginRequest : IRequest<Result<LoginResponse>>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
