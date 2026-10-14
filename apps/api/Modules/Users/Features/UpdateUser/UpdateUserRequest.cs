using Aegis.Api.Modules.Users.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.UpdateUser;

public sealed record UpdateUserRequest(Guid Id, string Email, string DisplayName) : IRequest<Result<UserDto>>;
