using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Features.UpdateReview;

namespace Aegis.Api.Tests.Modules.Reviews.Features.UpdateReview;

public sealed class UpdateReviewValidatorTests
{
    private readonly UpdateReviewValidator _validator = new();

    [Fact]
    public void Validate_ValidRequest_Passes()
    {
        var result = _validator.Validate(Request());

        Assert.True(result.IsValid);
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

    [Theory]
    [InlineData((ReviewStatus)99)]
    [InlineData((ReviewStatus)(-1))]
    public void Validate_StatusOutsideEnum_Fails(ReviewStatus status)
    {
        var result = _validator.Validate(Request() with { Status = status });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Invalid review status.");
    }

    private static UpdateReviewRequest Request() => new()
    {
        Id = Guid.NewGuid(),
        Title = "Review",
        Status = ReviewStatus.InProgress,
    };
}
