using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Aegis.Api.Data;

/// <summary>
/// Used only by the EF Core CLI (`dotnet ef migrations add`, `dotnet ef database update`).
/// It bypasses the application host so scaffolding a migration does not need Aspire to be
/// running and supplying the connection string. This is never used at runtime.
/// </summary>
public class AegisDbContextFactory : IDesignTimeDbContextFactory<AegisDbContext>
{
    public AegisDbContext CreateDbContext(string[] args)
    {
        // `migrations add` never opens a connection, so the fallback only has to be a valid
        // connection string. Set ConnectionStrings__aegisdb to target a real database when
        // running `dotnet ef database update`.
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__aegisdb")
            ?? "Host=localhost;Port=5432;Database=aegisdb;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<AegisDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AegisDbContext(options);
    }
}
