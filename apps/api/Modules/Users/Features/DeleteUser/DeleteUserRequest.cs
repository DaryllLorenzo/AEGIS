using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.DeleteUser;

public sealed record DeleteUserRequest(Guid Id) : IRequest<Result>;
