using Aegis.Api.Endpoints.Groups.Features.CreateGroup;
using Aegis.Api.Endpoints.Groups.Features.GetGroupById;
using Aegis.Api.Endpoints.Groups.Features.GetGroups;
using Aegis.Api.Endpoints.Groups.Services;
using FluentValidation;

namespace Aegis.Api.Endpoints.Groups;

internal static class GroupsConfigurations
{
    public const string GroupsTag = "Groups";
    public const string GroupsPrefixUri = "api/groups";

    internal static WebApplicationBuilder AddGroupsModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<GroupSieveProcessor>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateGroupValidator>();
        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetGroupsRequest>());
        return builder;
    }

    internal static IEndpointRouteBuilder MapGroupsModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var groups = endpoints.MapGroup(GroupsPrefixUri);
        groups.MapGetGroupsEndpoint();
        groups.MapGetGroupByIdEndpoint();
        groups.MapCreateGroupEndpoint();
        return endpoints;
    }
}
