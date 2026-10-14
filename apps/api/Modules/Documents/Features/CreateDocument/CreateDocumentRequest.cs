using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.CreateDocument;

public sealed record CreateDocumentRequest : IRequest<Result<DocumentDto>>
{
    public Guid GroupId { get; init; }
    public Guid? ParentId { get; init; }
    public required string Name { get; init; }
    public DocumentType Type { get; init; }
    public int? TotalPages { get; init; }
    public required Stream FileStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public long FileSize { get; init; }
}
