using System.Text.Json;
using Aegis.Api.Modules.Annotations.Features.BulkUpdateAnnotations;

namespace Aegis.Api.Tests.Modules.Annotations.Features.BulkUpdateAnnotations;

public sealed class BulkUpdateAnnotationsValidatorTests
{
    private readonly BulkUpdateAnnotationsValidator _validator = new();

    [Fact]
    public void Validate_ValidRequest_Passes()
    {
        var result = _validator.Validate(Request());

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_EmptyDocumentId_Fails()
    {
        var result = _validator.Validate(Request() with { DocumentId = Guid.Empty });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Document ID is required.");
    }

    [Fact]
    public void Validate_PageNumberZero_Fails()
    {
        var result = _validator.Validate(Request(annotations: [Item(pageNumber: 0)]));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Page number must be greater than 0.");
    }

    [Fact]
    public void Validate_EmptyGeometry_Fails()
    {
        var result = _validator.Validate(Request(annotations: [Item(emptyGeometry: true)]));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Geometry is required.");
    }

    [Fact]
    public void Validate_TooLongContent_Fails()
    {
        var result = _validator.Validate(Request(annotations: [Item(content: new string('a', 2001))]));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Content must not exceed 2000 characters.");
    }

    private static BulkUpdateAnnotationsRequest Request(AnnotationBulkItem[]? annotations = null) => new()
    {
        DocumentId = Guid.NewGuid(),
        Annotations = [.. annotations ?? [Item()]],
    };

    private static AnnotationBulkItem Item(
        int pageNumber = 1,
        string? content = null,
        bool emptyGeometry = false) => new()
        {
            PageNumber = pageNumber,
            Type = "highlight",
            Geometry = emptyGeometry
            ? default
            : JsonDocument.Parse("{\"x\":1}").RootElement,
            Content = content,
        };
}
