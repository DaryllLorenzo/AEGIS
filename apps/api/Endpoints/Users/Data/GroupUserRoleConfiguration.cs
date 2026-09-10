using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Api.Endpoints.Users.Data;

public sealed class GroupUserRoleConfiguration : IEntityTypeConfiguration<GroupUserRole>
{
    public void Configure(EntityTypeBuilder<GroupUserRole> builder)
    {
        builder.ToTable("GroupUserRoles");

        builder.HasKey(gur => gur.Id);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(gur => gur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Group>()
            .WithMany()
            .HasForeignKey(gur => gur.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Role>()
            .WithMany()
            .HasForeignKey(gur => gur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(gur => gur.UserId);
        builder.HasIndex(gur => gur.GroupId);
        builder.HasIndex(gur => gur.RoleId);
        builder.HasIndex(gur => new { gur.UserId, gur.GroupId, gur.RoleId }).IsUnique();
    }
}
