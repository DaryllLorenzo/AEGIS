using Aegis.Api.Endpoints.Faculties.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.UpdateFaculty;

public sealed record UpdateFacultyRequest(Guid Id, string Name, string? Code, string? Description) : IRequest<FacultyDto>;
