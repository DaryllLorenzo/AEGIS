namespace Aegis.Api.Modules.Reviews.Data;

/// <summary>
/// Legal review status flow: Pending -> InProgress -> Completed.
/// Anything else (including moves out of Completed) is rejected.
/// </summary>
public static class ReviewTransitions
{
    public static bool CanTransition(ReviewStatus from, ReviewStatus to) => (from, to) switch
    {
        (ReviewStatus.Pending, ReviewStatus.InProgress) => true,
        (ReviewStatus.InProgress, ReviewStatus.Completed) => true,
        _ => false,
    };
}
