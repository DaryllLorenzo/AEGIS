using Aegis.Api.Endpoints.Faculties.Exceptions;
using Aegis.Api.Shared.Authz;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Faculties.Features.DeleteFaculty;

internal static class DeleteFacultyEndpoint
{
    internal const string Name = "DeleteFaculty";

    internal static RouteHandlerBuilder MapDeleteFacultyEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapDelete("/{id:guid}", Handle)
            .WithTags(FacultiesConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Deletes a faculty.")
            .RequireAuthorization()
            .RequireAdmin();

        static async Task<Results<NoContent, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                await sender.Send(new DeleteFacultyRequest(id), cancellationToken);
                return TypedResults.NoContent();
            }
            catch (FacultyNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
