using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.Refresh;

public sealed record RefreshRequest : IRequest<Result<RefreshResponse>>
{
    public required string RefreshToken { get; init; }
}
