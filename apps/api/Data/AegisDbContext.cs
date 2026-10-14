using Aegis.Api.Modules.Annotations.Data;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Faculties.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Reviews.Data;
using Aegis.Api.Modules.Roles.Data;
using Aegis.Api.Modules.Users.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Data;

public class AegisDbContext(DbContextOptions<AegisDbContext> options) : DbContext(options)
{
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Annotation> Annotations => Set<Annotation>();

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<GroupUserRole> UserRoles => Set<GroupUserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new FacultyConfiguration());
        modelBuilder.ApplyConfiguration(new DocumentConfiguration());
        modelBuilder.ApplyConfiguration(new ReviewConfiguration());
        modelBuilder.ApplyConfiguration(new AnnotationConfiguration());

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new GroupConfiguration());
        modelBuilder.ApplyConfiguration(new GroupUserRoleConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
    }
}
