using Aegis.Api.Modules.Reviews.Data;

namespace Aegis.Api.Tests.Modules.Reviews.Data;

public sealed class ReviewTransitionsTests
{
    [Theory]
    [InlineData(ReviewStatus.Pending, ReviewStatus.InProgress)]
    [InlineData(ReviewStatus.InProgress, ReviewStatus.Completed)]
    public void CanTransition_AllowsLegalSteps(ReviewStatus from, ReviewStatus to) =>
        Assert.True(ReviewTransitions.CanTransition(from, to));

    [Theory]
    [InlineData(ReviewStatus.Pending, ReviewStatus.Pending)]
    [InlineData(ReviewStatus.Pending, ReviewStatus.Completed)]
    [InlineData(ReviewStatus.InProgress, ReviewStatus.Pending)]
    [InlineData(ReviewStatus.InProgress, ReviewStatus.InProgress)]
    [InlineData(ReviewStatus.Completed, ReviewStatus.Pending)]
    [InlineData(ReviewStatus.Completed, ReviewStatus.InProgress)]
    [InlineData(ReviewStatus.Completed, ReviewStatus.Completed)]
    public void CanTransition_RejectsEverythingElse(ReviewStatus from, ReviewStatus to) =>
        Assert.False(ReviewTransitions.CanTransition(from, to));
}
