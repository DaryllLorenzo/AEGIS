using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.CreateFaculty;

public sealed record CreateFacultyRequest : IRequest<FacultyDto>
{
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
}
