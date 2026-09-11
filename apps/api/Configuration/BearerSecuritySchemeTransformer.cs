using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Aegis.Api.Configuration;

internal sealed class BearerSecuritySchemeTransformer(
    IAuthenticationSchemeProvider authenticationSchemeProvider)
    : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        var authenticationSchemes =
            await authenticationSchemeProvider.GetAllSchemesAsync();

        // Solo actúa si la aplicación tiene configurado un esquema "Bearer"
        if (!authenticationSchemes.Any(authScheme => authScheme.Name == "Bearer"))
        {
            return;
        }

        // Define el esquema tal como lo espera Scalar: type: http, scheme: bearer
        var bearerScheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme."
        };

        // Inicializa los componentes del documento si no existen
        document.Components ??= new OpenApiComponents();

        // Añade el esquema al documento (API moderna de .NET 10)
        document.AddComponent("Bearer", bearerScheme);

        // List<string> en lugar de Array.Empty<string>()
        var securityRequirement = new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
        };

        // document.Paths puede ser null
        if (document.Paths is null)
        {
            return;
        }

        foreach (var path in document.Paths.Values)
        {
            // path.Operations puede ser null
            if (path.Operations is null)
            {
                continue;
            }

            foreach (var operation in path.Operations.Values)
            {
                // operation puede ser null
                if (operation is null)
                {
                    continue;
                }

                // Security puede no estar inicializada
                operation.Security ??= new List<OpenApiSecurityRequirement>();
                operation.Security.Add(securityRequirement);
            }
        }
    }
}