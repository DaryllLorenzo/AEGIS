using Aegis.Api.Endpoints.Documents.Data;
using Aegis.Api.Endpoints.Faculties.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Data;

public class AegisDbContext(DbContextOptions<AegisDbContext> options) : DbContext(options)
{
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new FacultyConfiguration());
        modelBuilder.ApplyConfiguration(new DocumentConfiguration());
    }
}
