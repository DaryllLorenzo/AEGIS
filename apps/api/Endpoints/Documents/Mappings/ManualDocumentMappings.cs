using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Documents.Dtos;

namespace Aegis.Api.Endpoints.Documents.Mappings;

public static class ManualDocumentMappings
{
    public static DocumentDto ToDto(this Document document) => new()
    {
        Id = document.Id,
        GroupId = document.GroupId,
        ParentId = document.ParentId,
        TotalPages = document.TotalPages,
        Name = document.Name,
        ObjectKey = document.ObjectKey,
        BucketName = document.BucketName,
        FileSize = document.FileSize,
        MimeType = document.MimeType,
        Checksum = document.Checksum,
        IsActive = document.IsActive,
        CreatedAt = document.CreatedAt,
        UpdatedAt = document.UpdatedAt,
    };
}
