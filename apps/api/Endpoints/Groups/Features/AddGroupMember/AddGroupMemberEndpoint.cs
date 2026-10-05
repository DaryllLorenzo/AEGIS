using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using Aegis.Api.Endpoints.Users.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Groups.Features.AddGroupMember;

internal static class AddGroupMemberEndpoint
{
    internal const string Name = "AddGroupMember";

    internal static RouteHandlerBuilder MapAddGroupMemberEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/{id:guid}/members", Handle)
            .WithTags(GroupsConfigurations.GroupsTag)
            .WithName(Name)
            .WithSummary("Links a user to a group.")
            .RequireAuthorization();

        static async Task<Results<Ok<GroupDto>, NotFound, ValidationProblem>> Handle(
            Guid id,
            AddGroupMemberBody body,
            ISender sender,
            CancellationToken cancellationToken)
        {
            var request = new AddGroupMemberRequest
            {
                GroupId = id,
                UserId = body.UserId,
                RoleId = body.RoleId,
            };

            try
            {
                var result = await sender.Send(request, cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (GroupNotFoundException)
            {
                return TypedResults.NotFound();
            }
            catch (UserNotFoundException)
            {
                return TypedResults.NotFound();
            }
        }
    }
}

internal sealed record AddGroupMemberBody
{
    public required Guid UserId { get; init; }
    public Guid? RoleId { get; init; }
}
