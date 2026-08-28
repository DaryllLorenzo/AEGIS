using Microsoft.Extensions.Options;
using Scalar.AspNetCore;

namespace Aegis.Api.Configuration;

/// <summary>
/// Settings for the API reference, bound from the "Scalar" configuration section.
/// Every value can be overridden per environment through appsettings, environment variables
/// (Scalar__Theme=Moon) or user secrets.
/// </summary>
public sealed class ScalarDocumentationOptions
{
    /// <summary>
    /// Serve the OpenAPI document and the Scalar UI. Disabled by default: appsettings.json
    /// turns it off and appsettings.Development.json turns it back on, so a production
    /// deployment has to opt in before exposing its API surface.
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>Route prefix the UI is served from.</summary>
    public string RoutePrefix { get; set; } = "/scalar";

    /// <summary>Title shown in the browser tab and the UI header.</summary>
    public string Title { get; set; } = "AEGIS API";

    /// <summary>Colour theme. Accepts any name from Scalar's ScalarTheme enum.</summary>
    public ScalarTheme Theme { get; set; } = ScalarTheme.Purple;

    /// <summary>Language preselected in the code samples panel.</summary>
    public ScalarTarget DefaultClientTarget { get; set; } = ScalarTarget.CSharp;

    /// <summary>Client preselected in the code samples panel, within the chosen language.</summary>
    public ScalarClient DefaultClient { get; set; } = ScalarClient.HttpClient;

    /// <summary>Keep credentials entered in the UI across page reloads.</summary>
    public bool PersistAuthentication { get; set; } = true;
}

/// <summary>
/// OpenAPI document generation and the Scalar reference UI that renders it. Kept out of
/// Program.cs so every documentation concern lives in one place.
/// </summary>
public static class ScalarConfiguration
{
    /// <summary>Name of the configuration section these options bind to.</summary>
    public const string SectionName = "Scalar";

    public static IHostApplicationBuilder AddScalarDocumentation(this IHostApplicationBuilder builder)
    {
        builder.Services
            .AddOptions<ScalarDocumentationOptions>()
            .Bind(builder.Configuration.GetSection(SectionName))
            .ValidateOnStart();

        // Generates the OpenAPI document Scalar renders. Registering the services is cheap;
        // the endpoint itself is only mapped when the options enable it.
        builder.Services.AddOpenApi();

        return builder;
    }

    public static WebApplication MapScalarDocumentation(this WebApplication app)
    {
        var options = app.Services.GetRequiredService<IOptions<ScalarDocumentationOptions>>().Value;

        if (!options.Enabled)
        {
            return app;
        }

        // Scalar fetches the document from the browser, so it has to be reachable as well.
        // Served at /openapi/v1.json, which is the route pattern Scalar expects by default.
        app.MapOpenApi();

        app.MapScalarApiReference(options.RoutePrefix, scalar =>
        {
            scalar
                .WithTitle(options.Title)
                .WithTheme(options.Theme)
                .WithDefaultHttpClient(options.DefaultClientTarget, options.DefaultClient);

            if (options.PersistAuthentication)
            {
                scalar.EnablePersistentAuthentication();
            }
        });

        return app;
    }
}
