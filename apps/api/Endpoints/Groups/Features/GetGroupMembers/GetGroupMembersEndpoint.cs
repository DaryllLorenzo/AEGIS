using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Features.GetGroupMembers;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroupMembers;

internal static class GetGroupMembersEndpoint
{
    internal const string Name = "GetGroupMembers";

    internal static RouteHandlerBuilder MapGetGroupMembersEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapGet("/{id:guid}/members", Handle)
            .WithTags(GroupsConfigurations.GroupsTag)
            .WithName(Name)
            .WithSummary("Returns the users linked to a group.")
            .RequireAuthorization();

        static async Task<Results<Ok<List<GroupMemberDto>>, NotFound>> Handle(
            Guid id,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var result = await sender.Send(new GetGroupMembersRequest { GroupId = id }, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}
