using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.DeleteFaculty;

public sealed record DeleteFacultyRequest(Guid Id) : IRequest<Result>;
