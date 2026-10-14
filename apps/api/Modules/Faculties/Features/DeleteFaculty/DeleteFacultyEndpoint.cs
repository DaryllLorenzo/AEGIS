using Aegis.Api.Common.Authz;
using Aegis.Api.Common.Results;
using Aegis.Common.Result;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Faculties.Features.DeleteFaculty;

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
            var result = await sender.Send(new DeleteFacultyRequest(id), cancellationToken);
            return result.ToNoContentOrNotFound();
        }
    }
}
