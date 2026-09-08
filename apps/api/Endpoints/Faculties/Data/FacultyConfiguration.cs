using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Faculties.Data;

public sealed class FacultyConfiguration : IEntityTypeConfiguration<Faculty>
{
    public void Configure(EntityTypeBuilder<Faculty> builder)
    {
        builder.ToTable("Faculties");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(f => f.Code)
            .HasMaxLength(50);

        builder.Property(f => f.Description)
            .HasMaxLength(1000);

        builder.HasIndex(f => f.Name);
        builder.HasIndex(f => f.Code).IsUnique().HasFilter("\"Code\" IS NOT NULL");
        builder.HasIndex(f => f.IsActive);
    }
}
