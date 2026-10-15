using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Features.CreateDocument;

namespace Aegis.Api.Tests.Modules.Documents.Features.CreateDocument;

public sealed class CreateDocumentValidatorTests
{
    private readonly CreateDocumentValidator _validator = new();

    [Fact]
    public void Validate_ValidRequest_Passes()
    {
        var result = _validator.Validate(Request());

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_EmptyGroupId_Fails()
    {
        var result = _validator.Validate(Request() with { GroupId = Guid.Empty });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Group ID is required.");
    }

    [Fact]
    public void Validate_EmptyName_Fails()
    {
        var result = _validator.Validate(Request() with { Name = "" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Document name is required.");
    }

    [Fact]
    public void Validate_NonPdfContentType_Fails()
    {
        var result = _validator.Validate(Request() with { ContentType = "text/plain" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Only PDF files are supported.");
    }

    [Fact]
    public void Validate_EmptyFile_Fails()
    {
        var result = _validator.Validate(Request() with { FileSize = 0 });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "File must not be empty.");
    }

    private static CreateDocumentRequest Request() => new()
    {
        GroupId = Guid.NewGuid(),
        Name = "Thesis",
        Type = DocumentType.Thesis,
        FileStream = new MemoryStream([1, 2, 3]),
        FileName = "thesis.pdf",
        ContentType = "application/pdf",
        FileSize = 3,
    };
}
