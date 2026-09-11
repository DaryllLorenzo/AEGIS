using Aegis.Api.Endpoints.Roles.Features.CreateRole;
using Aegis.Api.Endpoints.Roles.Features.GetRoleById;
using Aegis.Api.Endpoints.Roles.Features.GetRoles;
using Aegis.Api.Endpoints.Roles.Services;
using FluentValidation;

namespace Aegis.Api.Endpoints.Roles;

internal static class RolesConfigurations
{
    public const string RolesTag = "Roles";
    public const string RolesPrefixUri = "api/roles";

    internal static WebApplicationBuilder AddRolesModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<RoleSieveProcessor>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateRoleValidator>();
        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetRolesRequest>());
        return builder;
    }

    internal static IEndpointRouteBuilder MapRolesModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var roles = endpoints.MapGroup(RolesPrefixUri);
        roles.MapGetRolesEndpoint();
        roles.MapGetRoleByIdEndpoint();
        roles.MapCreateRoleEndpoint();
        return endpoints;
    }
}
