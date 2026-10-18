using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.CreateFaculty;

public sealed record CreateFacultyRequest : IRequest<Result<FacultyDto>>
{
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
}
