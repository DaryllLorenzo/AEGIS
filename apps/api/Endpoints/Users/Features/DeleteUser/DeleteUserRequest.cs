using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.DeleteUser;

public sealed record DeleteUserRequest(Guid Id) : IRequest<Unit>;
