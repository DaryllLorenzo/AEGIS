using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Groups.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Groups.Features.RemoveGroupMember;

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
            var result = await sender.Send(
                new RemoveGroupMemberRequest { GroupId = id, UserId = userId },
                cancellationToken);
            return result.ToOkOrNotFound();
        }
    }
}
