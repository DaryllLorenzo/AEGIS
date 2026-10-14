using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Faculties.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Faculties.Features.GetFacultyById;

internal static class GetFacultyByIdEndpoint
{
    internal const string Name = "GetFacultyById";

    internal static RouteHandlerBuilder MapGetFacultyByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(FacultiesConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Returns a faculty by its ID.");

        static async Task<Results<Ok<FacultyDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new GetFacultyByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
