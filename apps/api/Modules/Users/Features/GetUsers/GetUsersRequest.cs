using Aegis.Api.Modules.Users.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.GetUsers;

public sealed record GetUsersRequest : SieveRequest, IRequest<PaginatedList<UserDto>>;
