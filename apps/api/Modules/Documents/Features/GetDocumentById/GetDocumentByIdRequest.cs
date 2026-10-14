using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.GetDocumentById;

public sealed record GetDocumentByIdRequest(Guid Id) : IRequest<Result<DocumentDto>>;
