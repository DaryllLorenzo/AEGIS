using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.Refresh;

public sealed record RefreshRequest : IRequest<RefreshResponse>
{
    public required string RefreshToken { get; init; }
}
