using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Features.CreateReview;

namespace Aegis.Api.Tests.Modules.Reviews.Features.CreateReview;

public sealed class CreateReviewValidatorTests
{
    private readonly CreateReviewValidator _validator = new();

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
    public void Validate_EmptyTitle_Fails()
    {
        var result = _validator.Validate(Request() with { Title = "" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Review title is required.");
    }

    [Fact]
    public void Validate_TooLongTitle_Fails()
    {
        var result = _validator.Validate(Request() with { Title = new string('a', 301) });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Title must not exceed 300 characters.");
    }

    private static CreateReviewRequest Request() => new()
    {
        DocumentId = Guid.NewGuid(),
        Title = "First review",
        Kind = "Proofreading",
        Version = "v1",
    };
}
