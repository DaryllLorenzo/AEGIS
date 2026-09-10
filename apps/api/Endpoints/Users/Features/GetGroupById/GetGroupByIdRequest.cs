using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetGroupById;

public sealed record GetGroupByIdRequest(Guid Id) : IRequest<GroupDto>;
