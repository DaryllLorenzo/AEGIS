using Aegis.Api.Endpoints.Documents.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Reviews.Data;

public sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(r => r.Kind)
            .HasMaxLength(100);

        builder.Property(r => r.Version)
            .HasMaxLength(50);

        builder.Property(r => r.Status)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.Assignee)
            .HasMaxLength(200);

        builder.HasOne<Document>()
            .WithMany()
            .HasForeignKey(r => r.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.DocumentId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.IsActive);
        builder.HasIndex(r => r.CreatedAt);
    }
}
