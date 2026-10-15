using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Reviews.Features.UpdateReview;
using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Tests.Fixtures;
using Aegis.Common.Result;

namespace Aegis.Api.Tests.Modules.Reviews.Features.UpdateReview;

public sealed class UpdateReviewHandlerTests : IDisposable
{
    private readonly TestDb _db = new();
    private readonly Guid _groupId = Guid.NewGuid();
    private readonly Guid _me = Guid.NewGuid();
    private readonly Guid _assignee = Guid.NewGuid();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_UnknownReview_ReturnsNotFound()
    {
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(Guid.NewGuid(), ReviewStatus.InProgress), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
        Assert.Equal("Review.NotFound", result.Error.Code);
    }

    [Fact]
    public async Task Handle_CompletedReview_ReturnsValidation()
    {
        var id = SeedReview(ReviewStatus.Completed, assigneeId: _assignee);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.Completed), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        Assert.Contains("completed", result.Error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_InvalidTransition_ReturnsValidation()
    {
        var id = SeedReview(ReviewStatus.Pending);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.Completed), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        Assert.Contains("Cannot transition", result.Error.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Handle_StartWithoutReviewerRole_ReturnsForbidden()
    {
        var id = SeedReview(ReviewStatus.Pending);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.InProgress), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Forbidden, result.Error.Type);
        Assert.Equal("Review.Permission", result.Error.Code);
    }

    [Fact]
    public async Task Handle_StartAsReviewer_Succeeds()
    {
        AddGroupRole(_me, GroupRoles.Reviewer);
        var id = SeedReview(ReviewStatus.Pending);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.InProgress), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(ReviewStatus.InProgress, result.Value.Status);
    }

    [Fact]
    public async Task Handle_CompleteByNonAssignee_ReturnsForbidden()
    {
        var id = SeedReview(ReviewStatus.InProgress, assigneeId: _assignee);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.Completed), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Forbidden, result.Error.Type);
        Assert.Equal("Review.Permission", result.Error.Code);
    }

    [Fact]
    public async Task Handle_CompleteAsAssignee_Succeeds()
    {
        var id = SeedReview(ReviewStatus.InProgress, assigneeId: _me);
        var handler = CreateHandler(_me);

        var result = await handler.Handle(Request(id, ReviewStatus.Completed), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(ReviewStatus.Completed, result.Value.Status);
    }

    [Fact]
    public async Task Handle_AssigneeOutsideGroup_ReturnsValidation()
    {
        var id = SeedReview(ReviewStatus.Pending);
        var handler = CreateHandler(_me);
        var request = new UpdateReviewRequest
        {
            Id = id,
            Title = "Review",
            Status = ReviewStatus.Pending,
            AssigneeId = Guid.NewGuid(),
        };

        var result = await handler.Handle(request, default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        Assert.Equal("assigneeId", result.Error.Code);
        Assert.Contains("assigneeId", result.Error.FieldErrors.Keys);
    }

    [Fact]
    public async Task Handle_SameStatusUpdate_SkipsTransitionChecks()
    {
        var id = SeedReview(ReviewStatus.Pending);
        var handler = CreateHandler(_me);
        var request = new UpdateReviewRequest { Id = id, Title = "Renamed", Status = ReviewStatus.Pending };

        var result = await handler.Handle(request, default);

        Assert.True(result.IsSuccess);
        Assert.Equal("Renamed", result.Value.Title);
    }

    private UpdateReviewHandler CreateHandler(Guid? currentUserId) =>
        new(_db.Db, HttpContextFactory.Create(currentUserId));

    private static UpdateReviewRequest Request(Guid id, ReviewStatus status) =>
        new() { Id = id, Title = "Review", Status = status };

    private void AddGroupRole(Guid userId, string roleName)
    {
        var role = new Role { Id = Guid.NewGuid(), Name = roleName };
        _db.Db.Roles.Add(role);
        _db.Db.UserRoles.Add(
            new GroupUserRole
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GroupId = _groupId,
                RoleId = role.Id,
                AssignedAt = DateTimeOffset.UtcNow,
            });
        _db.Db.SaveChanges();
    }

    private Guid SeedReview(ReviewStatus status, Guid? assigneeId = null)
    {
        var document = new Document
        {
            Id = Guid.NewGuid(),
            GroupId = _groupId,
            Name = "Thesis",
            Type = DocumentType.Thesis,
            Version = 1,
            ObjectKey = "documents/thesis.pdf",
            BucketName = "aegis-documents",
            MimeType = "application/pdf",
            Checksum = "abc",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var review = new Review
        {
            Id = Guid.NewGuid(),
            DocumentId = document.Id,
            UserId = _me,
            Title = "Original",
            Status = status,
            AssigneeId = assigneeId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Db.Documents.Add(document);
        _db.Db.Reviews.Add(review);
        _db.Db.SaveChanges();
        return review.Id;
    }
}
