using Aegis.Api.Modules.Users.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.GetUserById;

public sealed record GetUserByIdRequest(Guid Id) : IRequest<Result<UserDto>>;
