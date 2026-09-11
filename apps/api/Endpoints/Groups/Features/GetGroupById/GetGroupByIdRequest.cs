using Aegis.Api.Endpoints.Groups.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroupById;

public sealed record GetGroupByIdRequest(Guid Id) : IRequest<GroupDto>;
