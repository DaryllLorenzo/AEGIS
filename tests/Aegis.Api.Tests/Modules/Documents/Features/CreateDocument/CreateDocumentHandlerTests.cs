using Aegis.Api.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Features.CreateDocument;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Users.Data;
using Aegis.Api.Tests.Fixtures;
using Aegis.Common.Result;

namespace Aegis.Api.Tests.Modules.Documents.Features.CreateDocument;

public sealed class CreateDocumentHandlerTests : IDisposable
{
    private readonly TestDb _db = new();
    private readonly FakeStorageService _storage = new();
    private readonly Guid _groupId = Guid.NewGuid();
    private readonly Guid _me = Guid.NewGuid();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_NonMember_ReturnsValidation()
    {
        var handler = CreateHandler();

        var result = await handler.Handle(Request(groupId: _groupId), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        Assert.Equal("groupId", result.Error.Code);
    }

    [Fact]
    public async Task Handle_ParentFromAnotherGroup_ReturnsValidation()
    {
        SeedMembership(_me, _groupId);
        var foreignParent = SeedDocument(Guid.NewGuid(), name: "Foreign");
        var handler = CreateHandler();

        var result = await handler.Handle(Request(groupId: _groupId, parentId: foreignParent), default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        Assert.Equal("parentId", result.Error.Code);
    }

    [Fact]
    public async Task Handle_RootDocument_StartsAtVersion1()
    {
        SeedMembership(_me, _groupId);
        var handler = CreateHandler();

        var result = await handler.Handle(Request(groupId: _groupId), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.Version);
        Assert.Equal("Thesis", result.Value.Name);
        Assert.Single(_storage.Uploads);
    }

    [Fact]
    public async Task Handle_NewVersion_InheritsParentAndIncrementsVersion()
    {
        SeedMembership(_me, _groupId);
        var parentId = SeedDocument(_groupId, name: "Thesis", type: DocumentType.Article, version: 4);
        var handler = CreateHandler();

        var result = await handler.Handle(
            Request(groupId: _groupId, parentId: parentId, name: "Ignored"),
            default);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Value.Version);
        Assert.Equal("Thesis", result.Value.Name);
        Assert.Equal(DocumentType.Article, result.Value.Type);
        Assert.Equal(parentId, result.Value.ParentId);
    }

    private CreateDocumentHandler CreateHandler() =>
        new(_db.Db, _storage, HttpContextFactory.Create(_me));

    private static CreateDocumentRequest Request(
        Guid groupId,
        Guid? parentId = null,
        string name = "Thesis") => new()
        {
            GroupId = groupId,
            ParentId = parentId,
            Name = name,
            Type = DocumentType.Thesis,
            TotalPages = 10,
            FileStream = new MemoryStream([1, 2, 3]),
            FileName = "thesis.pdf",
            ContentType = "application/pdf",
            FileSize = 3,
        };

    private void SeedMembership(Guid userId, Guid groupId)
    {
        var role = new Role { Id = Guid.NewGuid(), Name = "Submitter" };
        _db.Db.Roles.Add(role);
        _db.Db.UserRoles.Add(
            new GroupUserRole
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GroupId = groupId,
                RoleId = role.Id,
                AssignedAt = DateTimeOffset.UtcNow,
            });
        _db.Db.SaveChanges();
    }

    private Guid SeedDocument(
        Guid groupId,
        string name = "Doc",
        DocumentType type = DocumentType.Thesis,
        int version = 1)
    {
        var document = new Document
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            Name = name,
            Type = type,
            Version = version,
            ObjectKey = $"documents/{Guid.NewGuid()}.pdf",
            BucketName = "aegis-documents",
            MimeType = "application/pdf",
            Checksum = "abc",
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.Db.Documents.Add(document);
        _db.Db.SaveChanges();
        return document.Id;
    }
}
