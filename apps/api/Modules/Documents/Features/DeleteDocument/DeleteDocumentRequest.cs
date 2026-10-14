using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.DeleteDocument;

public sealed record DeleteDocumentRequest(Guid Id) : IRequest<Result>;
