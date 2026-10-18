using Aegis.Api.Modules.Groups.Features.AddGroupMember;
using Aegis.Api.Modules.Groups.Features.CreateGroup;
using Aegis.Api.Modules.Groups.Features.GetGroupById;
using Aegis.Api.Modules.Groups.Features.GetGroupMembers;
using Aegis.Api.Modules.Groups.Features.GetGroups;
using Aegis.Api.Modules.Groups.Features.RemoveGroupMember;
using Aegis.Api.Modules.Groups.Services;

namespace Aegis.Api.Modules.Groups;

internal static class GroupsConfigurations
{
    public const string GroupsTag = "Groups";
    public const string GroupsPrefixUri = "api/groups";

    internal static WebApplicationBuilder AddGroupsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<GroupSieveProcessor>();
        return builder;
    }

    internal static IEndpointRouteBuilder MapGroupsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var groups = endpoints.MapGroup(GroupsPrefixUri);
        groups.MapGetGroupsEndpoint();
        groups.MapGetGroupByIdEndpoint();
        groups.MapCreateGroupEndpoint();
        groups.MapGetGroupMembersEndpoint();
        groups.MapAddGroupMemberEndpoint();
        groups.MapRemoveGroupMemberEndpoint();
        return endpoints;
    }
}
