using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Groups.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Groups.Features.GetGroupById;

internal static class GetGroupByIdEndpoint
{
    internal const string Name = "GetGroupById";

    internal static RouteHandlerBuilder MapGetGroupByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}", Handle)
            .WithTags(GroupsConfigurations.GroupsTag)
            .WithName(Name)
            .WithSummary("Returns a group by its ID.")
            .RequireAuthorization();

        static async Task<Results<Ok<GroupDto>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new GetGroupByIdRequest(id), cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
