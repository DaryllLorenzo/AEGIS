using Aegis.Api.Common.Authz;
using Aegis.Api.Modules.Faculties.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Faculties.Features.CreateFaculty;

internal static class CreateFacultyEndpoint
{
    internal const string Name = "CreateFaculty";

    internal static RouteHandlerBuilder MapCreateFacultyEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(FacultiesConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Creates a new faculty.")
            .RequireAuthorization()
            .RequireAdmin();

        static async Task<Results<Created<FacultyDto>, ValidationProblem>> Handle(
            CreateFacultyRequest request,
            ISender sender,
            IValidator<CreateFacultyRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);

            return TypedResults.Created(
                $"/api/faculties/{result.Id}",
                result);
        }
    }
}
