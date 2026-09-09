using Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;
using Aegis.Api.Endpoints.Annotations.Features.GetAnnotationsByDocumentId;
using FluentValidation;

namespace Aegis.Api.Endpoints.Annotations;

internal static class AnnotationsConfigurations
{
    public const string Tag = "Annotations";
    public const string AnnotationsPrefixUri = "api/annotations";

    internal static WebApplicationBuilder AddAnnotationsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddValidatorsFromAssemblyContaining<BulkUpdateAnnotationsValidator>();
        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetAnnotationsByDocumentIdRequest>());
        return builder;
    }

    internal static IEndpointRouteBuilder MapAnnotationsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var annotations = endpoints.MapGroup(AnnotationsPrefixUri);
        annotations.MapGetAnnotationsByDocumentIdEndpoint();
        annotations.MapBulkUpdateAnnotationsEndpoint();
        return endpoints;
    }
}
