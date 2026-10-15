using Aegis.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Tests.Fixtures;

// Fresh in-memory AegisDbContext per test; no Postgres needed.
public sealed class TestDb : IDisposable
{
    private readonly string _name = $"aegis-tests-{Guid.NewGuid()}";

    public AegisDbContext Db { get; }

    public TestDb()
    {
        var options = new DbContextOptionsBuilder<AegisDbContext>()
            .UseInMemoryDatabase(_name)
            .Options;
        Db = new AegisDbContext(options);
    }

    public void Dispose() => Db.Dispose();
}
