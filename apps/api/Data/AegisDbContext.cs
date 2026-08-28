using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Data;

public class AegisDbContext(DbContextOptions<AegisDbContext> options) : DbContext(options)
{
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(note => note.Id);
            entity.Property(note => note.Title).HasMaxLength(200).IsRequired();
            entity.HasIndex(note => note.CreatedAt);
        });
    }
}
