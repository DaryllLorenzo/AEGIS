using Aegis.Api.Endpoints.Documents.Features.CreateDocument;
using Aegis.Api.Endpoints.Documents.Features.DeleteDocument;
using Aegis.Api.Endpoints.Documents.Features.GetDocumentById;
using Aegis.Api.Endpoints.Documents.Features.GetDocuments;
using Aegis.Api.Endpoints.Documents.Features.UpdateDocument;
using Aegis.Api.Endpoints.Documents.Services;
using FluentValidation;

namespace Aegis.Api.Endpoints.Documents;

internal static class DocumentsConfiguration
{
    public const string Tag = "Documents";
    public const string DocumentsPrefixUri = "api/documents";

    internal static WebApplicationBuilder AddDocumentsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<DocumentSieveProcessor>();

        builder.Services.AddValidatorsFromAssemblyContaining<CreateDocumentValidator>();

        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetDocumentsRequest>());

        return builder;
    }

    internal static IEndpointRouteBuilder MapDocumentsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var documents = endpoints.MapGroup(DocumentsPrefixUri);

        documents.MapGetDocumentsEndpoint();
        documents.MapGetDocumentByIdEndpoint();
        documents.MapCreateDocumentEndpoint();
        documents.MapUpdateDocumentEndpoint();
        documents.MapDeleteDocumentEndpoint();

        return endpoints;
    }
}
