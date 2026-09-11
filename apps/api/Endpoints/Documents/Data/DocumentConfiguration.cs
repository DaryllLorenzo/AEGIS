using Aegis.Api.Endpoints.Groups.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Documents.Data;

public sealed class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Name)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(d => d.ObjectKey)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(d => d.BucketName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(d => d.MimeType)
            .HasMaxLength(100);

        builder.Property(d => d.Checksum)
            .HasMaxLength(128);

        builder.HasOne<Group>()
            .WithMany()
            .HasForeignKey(d => d.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Document>()
            .WithMany()
            .HasForeignKey(d => d.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(d => d.GroupId);
        builder.HasIndex(d => d.Name);
        builder.HasIndex(d => d.ParentId);
        builder.HasIndex(d => d.IsActive);
        builder.HasIndex(d => d.CreatedAt);
    }
}
