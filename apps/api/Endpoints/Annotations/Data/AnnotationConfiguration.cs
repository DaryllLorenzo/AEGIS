using Aegis.Api.Endpoints.Documents.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Annotations.Data;

public sealed class AnnotationConfiguration : IEntityTypeConfiguration<Annotation>
{
    public void Configure(EntityTypeBuilder<Annotation> builder)
    {
        builder.ToTable("Annotations");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Type)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.Geometry)
            .IsRequired();

        builder.Property(a => a.Content)
            .HasMaxLength(2000);

        builder.Property(a => a.Color)
            .HasMaxLength(20);

        builder.HasOne<Document>()
            .WithMany()
            .HasForeignKey(a => a.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.DocumentId);
        builder.HasIndex(a => a.PageNumber);
        builder.HasIndex(a => a.Type);
        builder.HasIndex(a => a.IsActive);
        builder.HasIndex(a => a.CreatedAt);
    }
}
