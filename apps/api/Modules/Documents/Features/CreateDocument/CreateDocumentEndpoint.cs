using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Documents.Data;
using Aegis.Api.Modules.Documents.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Modules.Documents.Features.CreateDocument;

internal static class CreateDocumentEndpoint
{
    internal const string Name = "CreateDocument";

    internal static RouteHandlerBuilder MapCreateDocumentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Creates a new document by uploading a file.")
            .RequireAuthorization()
            .DisableAntiforgery();

        static async Task<Results<Created<DocumentDto>, NotFound, ValidationProblem, UnauthorizedHttpResult>> Handle(
            IFormFile file,
            [FromForm] Guid groupId,
            [FromForm] string name,
            [FromForm] string? parentId,
            [FromForm] DocumentType type,
            [FromForm] int? totalPages,
            ISender sender,
            IValidator<CreateDocumentRequest> validator,
            CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["file"] = ["A file is required."]
                });
            }

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["file"] = ["Only PDF files are supported."]
                });
            }

            var request = new CreateDocumentRequest
            {
                GroupId = groupId,
                ParentId = Guid.TryParse(parentId, out var pid) ? pid : null,
                Name = name,
                Type = type,
                TotalPages = totalPages,
                FileStream = file.OpenReadStream(),
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);
            return result.ToCreatedNotFoundOrValidation(d => $"/api/documents/{d.Id}");
        }
    }
}
