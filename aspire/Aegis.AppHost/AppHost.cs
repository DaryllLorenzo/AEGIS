using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// Everything below is driven by the "AppHost" section of appsettings.json. Any value can be
// overridden per machine without touching the file, using the double-underscore environment
// variable form (AppHost__Ports__Api=5185) or `dotnet user-secrets`.
var configuration = builder.Configuration;

// Which resources to start. PostgreSQL is not listed: the API cannot run without it.
var enableApi = configuration.GetValue("AppHost:Services:Api", true);
var enableWeb = configuration.GetValue("AppHost:Services:Web", true);
var enablePgAdmin = configuration.GetValue("AppHost:Services:PgAdmin", false);

// Pinned host ports. Aspire assigns random ones by default, which moves URLs on every
// restart, breaks open browser tabs and changes the CORS origin the API is told about.
var apiPort = configuration.GetValue("AppHost:Ports:Api", 5180);
var webPort = configuration.GetValue("AppHost:Ports:Web", 3000);

// "dev" runs the Next.js dev server as a host process with hot reload. "container" builds
// apps/web/Dockerfile and runs the production image instead, which needs Docker buildx.
var webMode = configuration.GetValue("AppHost:Web:Mode", "dev");
var installWebPackages = configuration.GetValue("AppHost:Web:InstallPackages", true);

var apiUrl = $"http://localhost:{apiPort}";
var webUrl = $"http://localhost:{webPort}";

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
// The only piece that always runs in a container. Managed by Aspire and meant for local
// development only: credentials are generated per run, and the named volume keeps the
// data across restarts.
var postgres = builder.AddPostgres("postgres")
    .WithImageTag("18-alpine")
    .WithDataVolume("aegis-postgres-data");

if (enablePgAdmin)
{
    // Opt-in database browser. Development credentials only.
    postgres.WithPgAdmin(pgAdmin => pgAdmin
        .WithImageTag("latest")
        .WithEnvironment("PGADMIN_DEFAULT_EMAIL", "admin@admin.com")
        .WithEnvironment("PGADMIN_DEFAULT_PASSWORD", "admin"));
}

var database = postgres.AddDatabase("aegisdb");

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------
// Runs as a host process: fast restarts, attachable from a debugger, and no image build.
// It applies its EF Core migrations on startup. The image in apps/api/Dockerfile is what
// docker-compose uses.
IResourceBuilder<ProjectResource>? api = null;

if (enableApi)
{
    api = builder.AddProject<Projects.Aegis_Api>("api")
        .WithEndpoint("http", endpoint =>
        {
            endpoint.Port = apiPort;
            endpoint.IsProxied = false;
        })
        .WithReference(database)
        .WaitFor(database)
        .WithHttpHealthCheck("/health")
        .WithExternalHttpEndpoints()
        // Let the browser call the API directly from the frontend origin.
        .WithEnvironment("Cors__AllowedOrigins__0", webUrl);
}

// ---------------------------------------------------------------------------
// Frontend
// ---------------------------------------------------------------------------
if (enableWeb && string.Equals(webMode, "container", StringComparison.OrdinalIgnoreCase))
{
    IResourceBuilder<ContainerResource> web = builder.AddDockerfile("web", "../../apps/web");

    web = web.WithHttpEndpoint(port: webPort, targetPort: 3000)
        // Next.js inlines NEXT_PUBLIC_* at build time and a build argument cannot reference
        // a live endpoint, which is why the pinned port above matters.
        .WithBuildArg("NEXT_PUBLIC_API_URL", apiUrl)
        .WithExternalHttpEndpoints();

    if (api is not null)
    {
        // Server components run inside the container, so let Aspire route them back to the
        // API process on the host rather than hard-coding localhost.
        web.WithEnvironment("API_URL", api.GetEndpoint("http")).WaitFor(api);
    }
    else
    {
        web.WithEnvironment("API_URL", apiUrl);
    }
}
else if (enableWeb)
{
    var web = builder.AddNextJsApp("web", "../../apps/web")
        // The installer runs on every start, so keep it to a tree check: skip the registry
        // when the cache already has the packages, and skip the audit and funding reports.
        // Measured on a warm tree: 1.43s -> 0.29s.
        .WithNpm(installWebPackages, "install", ["--prefer-offline", "--no-audit", "--no-fund"])
        .WithEndpoint("http", endpoint =>
        {
            endpoint.Port = webPort;
            endpoint.TargetPort = webPort;
            endpoint.IsProxied = false;
        })
        // Both run as host processes, so one URL serves server components and the browser.
        .WithEnvironment("API_URL", apiUrl)
        .WithEnvironment("NEXT_PUBLIC_API_URL", apiUrl)
        .WithExternalHttpEndpoints();

    if (api is not null)
    {
        web.WaitFor(api);
    }
}

builder.Build().Run();
