using MediatR;

namespace Aegis.Api.Endpoints.Faculties.Features.DeleteFaculty;

public sealed record DeleteFacultyRequest(Guid Id) : IRequest<Unit>;
