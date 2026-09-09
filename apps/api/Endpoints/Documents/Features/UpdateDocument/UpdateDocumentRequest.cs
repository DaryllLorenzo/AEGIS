using Aegis.Api.Endpoints.Documents.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.UpdateDocument;

public sealed record UpdateDocumentRequest : IRequest<DocumentDto>
{
    public Guid Id { get; init; }
    public Guid? ParentId { get; init; }
    public int? TotalPages { get; init; }
    public required string Name { get; init; }
    public Stream? FileStream { get; init; }
    public string? FileName { get; init; }
    public string? ContentType { get; init; }
    public long? FileSize { get; init; }
}
