using Aegis.Api.Common.Paging;
using Aegis.Api.Endpoints.Users.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetUsers;

public sealed record GetUsersRequest : SieveRequest, IRequest<PaginatedList<UserDto>>;
