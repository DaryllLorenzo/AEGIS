using System.Text.Json;
using Aegis.Api.Endpoints.Annotations.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;

public sealed record BulkUpdateAnnotationsRequest : IRequest<List<AnnotationDto>>
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
