using Aegis.Api.Endpoints.Faculties.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Groups.Data;

public sealed class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.ToTable("Groups");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(g => g.Description)
            .HasMaxLength(1000);

        builder.HasOne<Faculty>()
            .WithMany()
            .HasForeignKey(g => g.FacultyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(g => g.Name);
        builder.HasIndex(g => g.FacultyId);
    }
}
