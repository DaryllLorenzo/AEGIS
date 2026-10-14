using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.GetGroupById;

public sealed record GetGroupByIdRequest(Guid Id) : IRequest<Result<GroupDto>>;
