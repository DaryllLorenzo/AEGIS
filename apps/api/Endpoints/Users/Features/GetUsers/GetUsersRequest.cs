using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetUsers;

public sealed record GetUsersRequest : SieveRequest, IRequest<PaginatedList<UserDto>>;
