using System.Text;
using Aegis.Api.Configuration;
using Aegis.Api.Data;
using Aegis.Api.Modules.Annotations;
using Aegis.Api.Modules.Documents;
using Aegis.Api.Modules.Faculties;
using Aegis.Api.Modules.Groups;
using Aegis.Api.Modules.Reviews;
using Aegis.Api.Modules.Roles;
using Aegis.Api.Modules.Users;
using Aegis.Email;
using Aegis.Storage.MinIO;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Sieve.Models;

var builder = WebApplication.CreateBuilder(args);

// Service discovery, HTTP resilience, health checks and OpenTelemetry.
builder.AddServiceDefaults();

// Binds AegisDbContext to the "aegisdb" connection string. Aspire injects it during
// development; docker-compose provides it via ConnectionStrings__aegisdb.
builder.AddNpgsqlDbContext<AegisDbContext>("aegisdb");

builder.Services.AddProblemDetails();

// Bound once and validated at startup: a missing or too-short key fails fast.
builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("The 'Jwt' configuration section is missing.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        };
    });

// Secure by default: every endpoint requires auth unless it opts out with AllowAnonymous.
builder.Services.AddAuthorization(options =>
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
builder.Services.AddHttpContextAccessor();

// OpenAPI document + Scalar reference UI. See Configuration/ScalarConfiguration.cs.
builder.AddScalarDocumentation();

// Module services
builder.AddFacultiesModuleServices();
builder.AddDocumentsModuleServices();
builder.AddReviewsModuleServices();
builder.AddAnnotationsModuleServices();
builder.AddUsersModuleServices();
builder.AddRolesModuleServices();
builder.AddGroupsModuleServices();
builder.Services.Configure<SieveOptions>(builder.Configuration.GetSection("Sieve"));

// Handlers and validators live in one assembly; register them once.
builder.Services.AddValidatorsFromAssemblyContaining<AegisDbContext>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<AegisDbContext>());

// Object storage — MinIO (Aegis.Storage package).
builder.Services.AddMinIOStorage(builder.Configuration);

// Email sender — SMTP via MailHog locally (Aegis.Email package).
builder.Services.AddEmail(builder.Configuration);

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

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Serves /openapi/v1.json and the Scalar UI when the "Scalar" section enables them.
app.MapScalarDocumentation();

// Apply pending migrations on startup. Fine for a single API instance; move this to a
// dedicated migration step before running more than one replica.
await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<AegisDbContext>();
    await database.Database.MigrateAsync();

    // Seed default roles and admin/student users.
    await AegisUserSeed.SeedAsync(scope.ServiceProvider);
}

// "/health" and "/alive" from Aegis.ServiceDefaults.
app.MapDefaultEndpoints();

// Module endpoints
app.MapFacultiesModuleEndpoints();
app.MapDocumentsModuleEndpoints();
app.MapReviewsModuleEndpoints();
app.MapAnnotationsModuleEndpoints();
app.MapUsersModuleEndpoints();
app.MapRolesModuleEndpoints();
app.MapGroupsModuleEndpoints();

app.Run();
