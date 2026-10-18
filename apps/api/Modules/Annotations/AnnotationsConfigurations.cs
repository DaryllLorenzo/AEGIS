using Aegis.Api.Modules.Annotations.Features.BulkUpdateAnnotations;
using Aegis.Api.Modules.Annotations.Features.GetAnnotationsByDocumentId;

namespace Aegis.Api.Modules.Annotations;

internal static class AnnotationsConfigurations
{
    public const string Tag = "Annotations";
    public const string AnnotationsPrefixUri = "api/annotations";

    internal static WebApplicationBuilder AddAnnotationsModuleServices(this WebApplicationBuilder builder)
    {
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
