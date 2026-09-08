using Aegis.Api.Endpoints.Faculties.Dtos;
using Aegis.Api.Endpoints.Faculties.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Faculties.Features.UpdateFaculty;

internal static class UpdateFacultyEndpoint
{
    internal const string Name = "UpdateFaculty";

    internal static RouteHandlerBuilder MapUpdateFacultyEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPut("/{id:guid}", Handle)
            .WithTags(FacultiesConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Updates an existing faculty.");

        static async Task<Results<Ok<FacultyDto>, NotFound, ValidationProblem>> Handle(
            Guid id,
            UpdateFacultyBody body,
            ISender sender,
            IValidator<UpdateFacultyRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new UpdateFacultyRequest(id, body.Name, body.Code, body.Description);

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
            catch (FacultyNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}

internal sealed record UpdateFacultyBody
{
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
}
