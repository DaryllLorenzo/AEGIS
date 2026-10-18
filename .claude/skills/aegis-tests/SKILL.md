---
name: aegis-tests
description: Use when adding or editing unit tests for a backend slice in apps/api (handler, validator, pure rule, Result→HTTP mapping). Covers what to test, the fixtures in tests/Aegis.Api.Tests, and the CI gate.
---

# Tests for a backend slice (`tests/Aegis.Api.Tests`)

## Decide first: does this slice deserve tests?

Test only files with **business rules that return `Error.*`** (or throw). Priority:

1. Handlers whose `Error.*` branches encode permissions, state machines or invariants
   (every `Error.Forbidden/Validation` path is a test).
2. Validators of critical flows (auth, documents, reviews, annotations).
3. Pure rules extracted from handlers into `Data/` static classes.
4. `ResultHttpExtensions` when its mapping changes.

**Skip**: `Get*`/Sieve endpoints, trivial `ToDto()` mappings, Email/MinIO adapters, endpoint
wiring. If the handler is only "load → map → return", do not write the test — boilerplate
coverage is not the goal.

## Layout

Mirror the API namespace under `tests/Aegis.Api.Tests/`:

```
Modules/<Area>/Features/<Name>/<Name>HandlerTests.cs
Modules/<Area>/Features/<Name>/<Name>ValidatorTests.cs
Modules/<Area>/Data/<PureRule>Tests.cs        # only for extracted pure logic
```

- One test class per handler/validator, `sealed`, implements `IDisposable` to dispose `TestDb`.
- Naming: `Handle_Scenario_Expected` (CA1707 is suppressed in the test csproj for this).
- xUnit `[Fact]`/`[Theory]` + `[InlineData]`; assert on `Error.Type`, `Error.Code` and
  `Error.FieldErrors.Keys` — never on full message text (messages may be reworded).

## Fixtures (reuse, don't add new ones)

| Fixture              | Replaces                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| `TestDb`             | Postgres: unique EF InMemory `AegisDbContext` per test                               |
| `HttpContextFactory` | Auth: `IHttpContextAccessor` with `NameIdentifier` claim (pass `null` for anonymous) |
| `TestConfig`         | `IConfiguration` with Jwt key/issuer/lifetime                                        |
| `FakeStorageService` | MinIO: records uploads, returns canned checksums                                     |

No mock libraries (no Moq/NSubstitute). A third fixture needs a third reason — follow the
"add a fixture only when…" rule in AGENTS.md.

## Handler test pattern

```csharp
public sealed class XHandlerTests : IDisposable
{
    private readonly TestDb _db = new();
    private readonly Guid _groupId = Guid.NewGuid();
    private readonly Guid _me = Guid.NewGuid();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Handle_UnknownId_ReturnsNotFound()
    {
        var handler = new XHandler(_db.Db, HttpContextFactory.Create(_me));
        var result = await handler.Handle(request, default);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
        Assert.Equal("X.NotFound", result.Error.Code);
    }
}
```

- Seed through `_db.Db` with plain entity instances (`SaveChanges()`), private helpers per
  class (`SeedReview`, `AddGroupRole`) — no shared seed framework.
- Test each `Error.*` branch and each success transition; skip happy-path-only CRUD.
- EF InMemory does not enforce FKs — seeding the parent is about the handler's queries,
  not referential integrity.

## Validator test pattern

Validators are pure — no fixtures:

```csharp
[Theory]
[InlineData("", "Email is required.")]
[InlineData("not-an-email", "Invalid email address.")]
public void Validate_EmailRules(string email, string? expectedError)
```

Assert `result.IsValid` and `result.Errors` messages (validators' messages are stable, unlike
handler error messages).

## Testing `ResultHttpExtensions` (internal, union types)

The class is `internal` — `InternalsVisibleTo("Aegis.Api.Tests")` is already in
`Aegis.Api.csproj`. The helpers return `Results<T1, T2>` unions: cast to `IResult` does **not**
give the inner result; unwrap with `((INestedHttpResult)union).Result`, then read
`((IStatusCodeHttpResult)inner).StatusCode`. `ValidationProblem` exposes field errors via
`.ProblemDetails.Errors`.

## Pure rule extraction

When a rule is buried in a handler (inline switch on enums, permission matrix), extract it to
a `static` class in the feature's `Data/` folder (e.g. `ReviewTransitions.CanTransition(from, to)`)
and test it without EF. Keep the handler as the orchestrator; the extracted class owns the rule.

## Verify

```bash
dotnet test tests/Aegis.Api.Tests   # fast loop while writing
```

Before finishing, the full CI gate (see AGENTS.md), including:

```bash
dotnet format --no-restore          # after touching any .cs
dotnet build --no-restore --configuration Release \
  -p:TreatWarningsAsErrors=true -p:AnalysisMode=Recommended -p:EnforceCodeStyleInBuild=true
dotnet test --no-build --configuration Release
```

Tests must pass under `AnalysisMode=Recommended` (CA1822: helpers that touch no instance data
must be `static`).
