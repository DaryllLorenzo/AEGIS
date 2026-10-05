using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Groups.Features.RemoveGroupMember;

internal static class RemoveGroupMemberEndpoint
{
    internal const string Name = "RemoveGroupMember";

    internal static RouteHandlerBuilder MapRemoveGroupMemberEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapDelete("/{id:guid}/members/{userId:guid}", Handle)
            .WithTags(GroupsConfigurations.GroupsTag)
            .WithName(Name)
            .WithSummary("Removes a user from a group.")
            .RequireAuthorization();

        static async Task<Results<Ok<GroupDto>, NotFound>> Handle(
            Guid id,
            Guid userId,
            ISender sender,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await sender.Send(
                    new RemoveGroupMemberRequest { GroupId = id, UserId = userId },
                    cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (GroupNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}
