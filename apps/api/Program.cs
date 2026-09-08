using Aegis.Api.Configuration;
using Aegis.Api.Data;
using Aegis.Api.Endpoints;
using Aegis.Api.Storage;
using Aegis.Api.Storage.MinIO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Minio;

var builder = WebApplication.CreateBuilder(args);

// Service discovery, HTTP resilience, health checks and OpenTelemetry.
builder.AddServiceDefaults();

// Binds AegisDbContext to the "aegisdb" connection string. Aspire injects it during
// development; docker-compose provides it via ConnectionStrings__aegisdb.
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb");

builder.Services.AddProblemDetails();

// OpenAPI document + Scalar reference UI. See Configuration/ScalarConfiguration.cs.
builder.AddScalarDocumentation();

// ---------------------------------------------------------------------------
// Object storage — MinIO
// ---------------------------------------------------------------------------
// Bind options from "Storage:MinIO" and register the MinIO SDK client as a singleton.
// The IStorageService abstraction means the rest of the code never references MinIO
// directly; swap the registration here to switch providers.
builder.Services.AddOptions<MinIOOptions>()
    .BindConfiguration(MinIOOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton<IMinioClient>(sp =>
{
    var opts = sp.GetRequiredService<IOptions<MinIOOptions>>().Value;
    var logger = sp.GetRequiredService<ILogger<MinIOStorageService>>();

    // Aspire may inject the endpoint as a full URL (http://localhost:PORT).
    // MinioClient.WithEndpoint expects only "host:port", so strip the scheme if present.
    var endpoint = opts.Endpoint;
    if (Uri.TryCreate(endpoint, UriKind.Absolute, out var uri))
    {
        endpoint = uri.IsDefaultPort ? uri.Host : $"{uri.Host}:{uri.Port}";
    }

    logger.LogInformation(
        "Building MinIO client — Endpoint: {Endpoint}, AccessKey: {AccessKey}, UseSsl: {UseSsl}",
        endpoint, opts.AccessKey, opts.UseSsl);

    var clientBuilder = new MinioClient()
        .WithEndpoint(endpoint)
        .WithCredentials(opts.AccessKey, opts.SecretKey)
        .WithRegion("us-east-1");  // MinIO default region — required for correct request signing.

    // WithSSL(false) is not the same as not calling it in some SDK versions.
    // Only enable SSL explicitly when requested.
    if (opts.UseSsl)
    {
        clientBuilder = clientBuilder.WithSSL();
    }

    return clientBuilder.Build();
});

builder.Services.AddScoped<IStorageService, MinIOStorageService>();

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

app.Run();