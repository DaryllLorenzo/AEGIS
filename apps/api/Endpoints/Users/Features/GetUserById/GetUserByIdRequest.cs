using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetUserById;

public sealed record GetUserByIdRequest(Guid Id) : IRequest<UserDto>;
