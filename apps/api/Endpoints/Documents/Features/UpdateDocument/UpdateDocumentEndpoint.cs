using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Endpoints.Documents.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Endpoints.Documents.Features.UpdateDocument;

internal static class UpdateDocumentEndpoint
{
    internal const string Name = "UpdateDocument";

    internal static RouteHandlerBuilder MapUpdateDocumentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPatch("/{id:guid}", Handle)
            .WithTags(DocumentsConfiguration.Tag)
            .WithName(Name)
            .WithSummary("Updates an existing document (name, metadata, and optionally replaces the file).")
            .RequireAuthorization()
            .DisableAntiforgery();

        static async Task<Results<Ok<DocumentDto>, NotFound, ValidationProblem>> Handle(
            Guid id,
            [FromForm] string name,
            [FromForm] string? parentId,
            [FromForm] int? totalPages,
            IFormFile? file,
            ISender sender,
            IValidator<UpdateDocumentRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new UpdateDocumentRequest
            {
                Id = id,
                Name = name,
                ParentId = Guid.TryParse(parentId, out var pid) ? pid : null,
                TotalPages = totalPages,
                FileStream = file?.OpenReadStream(),
                FileName = file?.FileName,
                ContentType = file?.ContentType,
                FileSize = file?.Length,
            };

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            try
            {
                var result = await sender.Send(request, cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (DocumentNotFoundException)
            {
                return TypedResults.NotFound();
            }
            catch (DocumentLockedException)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["document"] = ["This document has a completed review and cannot be modified."]
                });
            }
        }
    }
}
