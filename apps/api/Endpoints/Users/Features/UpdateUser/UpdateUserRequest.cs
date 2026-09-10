using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.UpdateUser;

public sealed record UpdateUserRequest(Guid Id, string Email, string DisplayName) : IRequest<UserDto>;
