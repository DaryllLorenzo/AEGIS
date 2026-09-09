using Aegis.Api.Endpoints.Documents.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

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
            .DisableAntiforgery();

        static async Task<Results<Created<DocumentDto>, ValidationProblem>> Handle(
            IFormFile file,
            [FromForm] string name,
            [FromForm] string? parentId,
            [FromForm] int totalPages,
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

            var request = new CreateDocumentRequest
            {
                ParentId = Guid.TryParse(parentId, out var pid) ? pid : null,
                Name = name,
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

            return TypedResults.Created(
                $"/api/documents/{result.Id}",
                result);
        }
    }
}
