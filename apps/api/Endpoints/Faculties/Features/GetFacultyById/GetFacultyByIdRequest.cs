using Aegis.Api.Endpoints.Faculties.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.GetFacultyById;

public sealed record GetFacultyByIdRequest(Guid Id) : IRequest<FacultyDto>;
