using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.Login;

public sealed record LoginRequest : IRequest<LoginResponse>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
