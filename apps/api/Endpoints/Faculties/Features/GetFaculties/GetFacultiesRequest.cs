using Aegis.Api.Common.Paging;
using Aegis.Api.Endpoints.Faculties.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFaculties;

public sealed record GetFacultiesRequest : SieveRequest, IRequest<PaginatedList<FacultyDto>>;
