using Aegis.Api.Configuration;
using Aegis.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Service discovery, HTTP resilience, health checks and OpenTelemetry.
builder.AddServiceDefaults();

// Binds AegisDbContext to the "aegisdb" connection string. Aspire injects it during
// development; docker-compose provides it via ConnectionStrings__aegisdb.
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb");

builder.Services.AddProblemDetails();

// OpenAPI document + Scalar reference UI. See Configuration/ScalarConfiguration.cs.
builder.AddScalarDocumentation();

// The browser talks to the API directly, so the web origin needs an explicit grant.
// Origins come from Cors:AllowedOrigins (the AppHost and docker-compose both set it).
const string WebCorsPolicy = "web";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options => options.AddPolicy(WebCorsPolicy, policy => policy
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors(WebCorsPolicy);

// Serves /openapi/v1.json and the Scalar UI when the "Scalar" section enables them.
app.MapScalarDocumentation();

// Apply pending migrations on startup. Fine for a single API instance; move this to a
// dedicated migration step before running more than one replica.
await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<AegisDbContext>();
    await database.Database.MigrateAsync();
}

// Sample vertical slice. Replace with the real AEGIS endpoints.
var notes = app.MapGroup("/api/notes");

notes.MapGet("/", async (AegisDbContext database, CancellationToken cancellationToken) =>
    await database.Notes
        .OrderByDescending(note => note.CreatedAt)
        .ToListAsync(cancellationToken));

notes.MapPost("/", async (CreateNoteRequest request, AegisDbContext database, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["title"] = ["Title is required."]
        });
    }

    var note = new Note
    {
        Id = Guid.CreateVersion7(),
        Title = request.Title.Trim(),
        CreatedAt = DateTimeOffset.UtcNow
    };

    database.Notes.Add(note);
    await database.SaveChangesAsync(cancellationToken);

    return Results.Created($"/api/notes/{note.Id}", note);
});

// "/health" and "/alive" from Aegis.ServiceDefaults.
app.MapDefaultEndpoints();

app.Run();

internal record CreateNoteRequest(string Title);
