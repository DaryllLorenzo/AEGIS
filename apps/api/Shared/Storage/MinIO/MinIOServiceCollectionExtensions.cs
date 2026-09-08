using Microsoft.Extensions.Options;
using Minio;

namespace Aegis.Api.Shared.Storage.MinIO;

public static class MinIOServiceCollectionExtensions
{
    public static IServiceCollection AddMinIOStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MinIOOptions>(configuration.GetSection(MinIOOptions.SectionName));

        services.AddSingleton<IMinioClient>(sp =>
        {
            var opts = sp.GetRequiredService<IOptions<MinIOOptions>>().Value;
            var logger = sp.GetRequiredService<ILogger<MinIOStorageService>>();

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
                .WithRegion("us-east-1");

            if (opts.UseSsl)
            {
                clientBuilder = clientBuilder.WithSSL();
            }

            return clientBuilder.Build();
        });

        services.AddScoped<IStorageService, MinIOStorageService>();

        return services;
    }
}
