using Aegis.Api.Modules.Documents.Features.CreateDocument;
using Aegis.Api.Modules.Documents.Features.DeleteDocument;
using Aegis.Api.Modules.Documents.Features.GetDocumentById;
using Aegis.Api.Modules.Documents.Features.GetDocuments;
using Aegis.Api.Modules.Documents.Features.UpdateDocument;
using Aegis.Api.Modules.Documents.Services;

namespace Aegis.Api.Modules.Documents;

internal static class DocumentsConfiguration
{
    public const string Tag = "Documents";
    public const string DocumentsPrefixUri = "api/documents";

    internal static WebApplicationBuilder AddDocumentsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<DocumentSieveProcessor>();

        return builder;
    }

    internal static IEndpointRouteBuilder MapDocumentsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var documents = endpoints.MapGroup(DocumentsPrefixUri);

        documents.MapGetDocumentsEndpoint();
        documents.MapGetDocumentByIdEndpoint();
        documents.MapGetDocumentDownloadEndpoint();
        documents.MapCreateDocumentEndpoint();
        documents.MapUpdateDocumentEndpoint();
        documents.MapDeleteDocumentEndpoint();

        return endpoints;
    }
}
