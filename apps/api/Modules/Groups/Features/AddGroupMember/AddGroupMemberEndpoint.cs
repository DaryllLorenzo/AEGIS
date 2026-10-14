using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Groups.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Groups.Features.AddGroupMember;

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
                Role = body.Role,
            };

            var result = await sender.Send(request, cancellationToken);
            return result.ToOkNotFoundOrValidation();
        }
    }
}

internal sealed record AddGroupMemberBody
{
    public required Guid UserId { get; init; }
    /// <summary>"Submitter" or "Reviewer". Defaults to "Submitter".</summary>
    public string? Role { get; init; }
}
