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
var enableMinIO = configuration.GetValue("AppHost:Services:MinIO", true);

// Pinned host ports. Aspire assigns random ones by default, which moves URLs on every
// restart, breaks open browser tabs and changes the CORS origin the API is told about.
var apiPort = configuration.GetValue("AppHost:Ports:Api", 5180);
var webPort = configuration.GetValue("AppHost:Ports:Web", 3000);
var minioPort = configuration.GetValue("AppHost:Ports:MinIO", 9000);
var minioConsolePort = configuration.GetValue("AppHost:Ports:MinIOConsole", 9001);

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
// Object storage (MinIO)
// ---------------------------------------------------------------------------
// Runs as a container, same as Postgres. Data persists in a named volume across
// restarts. The API port (9000) is the S3-compatible endpoint; the console port
// (9001) is the browser UI — http://localhost:9001 with the credentials below.
// Credentials are development-only: override with AppHost:MinIO:* or user-secrets.
//
// The AppHost injects the real endpoint and credentials into the API via environment
// variables (Storage__MinIO__*) so the API always finds MinIO regardless of which
// host port Aspire assigned.
IResourceBuilder<ContainerResource>? minio = null;

if (enableMinIO)
{
    var minioUser = configuration.GetValue("AppHost:MinIO:RootUser", "minioadmin");
    var minioPassword = configuration.GetValue("AppHost:MinIO:RootPassword", "minioadmin");

    minio = builder.AddContainer("minio", "minio/minio")
        .WithImageTag("latest")
        .WithArgs("server", "/data", "--console-address", $":{minioConsolePort}")
        .WithEnvironment("MINIO_ROOT_USER", minioUser)
        .WithEnvironment("MINIO_ROOT_PASSWORD", minioPassword)
        .WithHttpEndpoint(port: minioPort, targetPort: 9000, name: "api")
        .WithHttpEndpoint(port: minioConsolePort, targetPort: minioConsolePort, name: "console")
        .WithVolume("aegis-minio-data", "/data")
        .WithUrlForEndpoint("console", endpoint => new ResourceUrlAnnotation
        {
            Url = endpoint.Url,
            DisplayText = "MinIO Console"
        });
}

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
        // Surface the Scalar API reference as its own link on the api resource in the
        // dashboard, next to the endpoint URL.
        .WithUrlForEndpoint("http", endpoint => new ResourceUrlAnnotation
        {
            Url = $"{endpoint.Url}/scalar",
            DisplayText = "Scalar"
        })
        // Let the browser call the API directly from the frontend origin.
        .WithEnvironment("Cors__AllowedOrigins__0", webUrl);

    // Inject MinIO connection details into the API so the MinIOStorageService can connect.
    // Use GetEndpoint so Aspire's proxy port is used (not the pinned container port).
    if (minio is not null)
    {
        var minioUser = configuration.GetValue("AppHost:MinIO:RootUser", "minioadmin");
        var minioPassword = configuration.GetValue("AppHost:MinIO:RootPassword", "minioadmin");
        var minioEndpoint = minio.GetEndpoint("api");

        api
            .WithEnvironment("Storage__MinIO__Endpoint", minioEndpoint)
            .WithEnvironment("Storage__MinIO__AccessKey", minioUser)
            .WithEnvironment("Storage__MinIO__SecretKey", minioPassword)
            .WithEnvironment("Storage__MinIO__UseSsl", "false");

        api.WaitFor(minio);
    }
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
