using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Users.Data;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(u => u.DisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.DisplayName);
        builder.HasIndex(u => u.IsActive);
    }
}
