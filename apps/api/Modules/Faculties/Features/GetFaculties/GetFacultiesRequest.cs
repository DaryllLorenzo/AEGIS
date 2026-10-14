using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.GetFaculties;

public sealed record GetFacultiesRequest : SieveRequest, IRequest<PaginatedList<FacultyDto>>;
