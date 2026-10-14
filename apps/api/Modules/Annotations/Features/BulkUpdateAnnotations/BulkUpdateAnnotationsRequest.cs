using System.Text.Json;
using Aegis.Api.Modules.Annotations.Dtos;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Annotations.Features.BulkUpdateAnnotations;

public sealed record BulkUpdateAnnotationsRequest : IRequest<Result<List<AnnotationDto>>>
{
    public Guid DocumentId { get; init; }
    public required List<AnnotationBulkItem> Annotations { get; init; }
}

public sealed record AnnotationBulkItem
{
    public Guid? Id { get; init; }
    public int PageNumber { get; init; }
    public required string Type { get; init; }
    public required JsonElement Geometry { get; init; }
    public string? Content { get; init; }
    public string? Color { get; init; }
}
