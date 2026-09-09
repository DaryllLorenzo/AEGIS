using Aegis.Api.Configuration;
using Aegis.Api.Data;
using Aegis.Api.Endpoints;
using Aegis.Api.Endpoints.Documents;
using Aegis.Api.Endpoints.Faculties;
using Aegis.Api.Shared.Storage.MinIO;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;

var builder = WebApplication.CreateBuilder(args);

// Service discovery, HTTP resilience, health checks and OpenTelemetry.
builder.AddServiceDefaults();

// Binds AegisDbContext to the "aegisdb" connection string. Aspire injects it during
// development; docker-compose provides it via ConnectionStrings__aegisdb.
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb");

builder.Services.AddProblemDetails();

// OpenAPI document + Scalar reference UI. See Configuration/ScalarConfiguration.cs.
builder.AddScalarDocumentation();

// Faculties module services — MediatR, FluentValidation, Sieve.
builder.AddFacultiesModuleServices();

// Documents module services — MediatR, FluentValidation, Sieve.
builder.AddDocumentsModuleServices();
builder.Services.Configure<SieveOptions>(builder.Configuration.GetSection("Sieve"));

// Object storage — MinIO (extracted to Shared/Storage/MinIO extension).
builder.Services.AddMinIOStorage(builder.Configuration);

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

// "/health" and "/alive" from Aegis.ServiceDefaults.
app.MapDefaultEndpoints();

// Test endpoints — remove before going to production.
app.MapMinIOTestEndpoints();

// Faculties module endpoints.
app.MapFacultiesModuleEndpoints();

// Documents module endpoints.
app.MapDocumentsModuleEndpoints();

app.Run();
