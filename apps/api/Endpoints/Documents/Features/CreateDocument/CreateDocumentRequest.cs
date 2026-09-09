using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed record CreateDocumentRequest : IRequest<DocumentDto>
{
    public Guid? ParentId { get; init; }
    public required string Name { get; init; }
    public int TotalPages { get; init; }
    public required Stream FileStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public long FileSize { get; init; }
}
