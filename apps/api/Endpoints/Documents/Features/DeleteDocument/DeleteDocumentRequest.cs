using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.DeleteDocument;

public sealed record DeleteDocumentRequest(Guid Id) : IRequest<Unit>;
