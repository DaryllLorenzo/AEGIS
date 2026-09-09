using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocumentById;

public sealed record GetDocumentByIdRequest(Guid Id) : IRequest<DocumentDto>;
