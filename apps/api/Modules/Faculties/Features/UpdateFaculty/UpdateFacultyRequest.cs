using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.UpdateFaculty;

public sealed record UpdateFacultyRequest(Guid Id, string Name, string? Code, string? Description)
    : IRequest<Result<FacultyDto>>;
