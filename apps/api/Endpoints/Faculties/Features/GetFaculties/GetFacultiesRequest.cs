using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFaculties;

public sealed record GetFacultiesRequest : SieveRequest, IRequest<PaginatedList<FacultyDto>>;
