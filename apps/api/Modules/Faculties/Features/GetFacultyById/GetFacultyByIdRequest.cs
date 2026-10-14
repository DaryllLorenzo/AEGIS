using Aegis.Api.Modules.Faculties.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Faculties.Features.GetFacultyById;

public sealed record GetFacultyByIdRequest(Guid Id) : IRequest<Result<FacultyDto>>;
