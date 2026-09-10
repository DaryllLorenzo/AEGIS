using Aegis.Api.Endpoints.Users.Features.CreateGroup;
using Aegis.Api.Endpoints.Users.Features.CreateRole;
using Aegis.Api.Endpoints.Users.Features.CreateUser;
using Aegis.Api.Endpoints.Users.Features.DeleteUser;
using Aegis.Api.Endpoints.Users.Features.GetGroupById;
using Aegis.Api.Endpoints.Users.Features.GetGroups;
using Aegis.Api.Endpoints.Users.Features.GetProtectedResource;
using Aegis.Api.Endpoints.Users.Features.GetRoleById;
using Aegis.Api.Endpoints.Users.Features.GetRoles;
using Aegis.Api.Endpoints.Users.Features.GetUserById;
using Aegis.Api.Endpoints.Users.Features.GetUsers;
using Aegis.Api.Endpoints.Users.Features.Login;
using Aegis.Api.Endpoints.Users.Features.UpdateUser;
using Aegis.Api.Endpoints.Users.Services;
using FluentValidation;

namespace Aegis.Api.Endpoints.Users;

internal static class UsersConfigurations
{
    public const string Tag = "Users";
    public const string UsersPrefixUri = "api/users";

    internal static WebApplicationBuilder AddUsersModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<UserSieveProcessor>();
        builder.Services.AddScoped<RoleSieveProcessor>();
        builder.Services.AddScoped<GroupSieveProcessor>();
        builder.Services.AddScoped<JwtTokenService>();

        builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateRoleValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<CreateGroupValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();

        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetUsersRequest>());

        return builder;
    }

    internal static IEndpointRouteBuilder MapUsersModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var users = endpoints.MapGroup(UsersPrefixUri);

        // Auth (no auth required)
        users.MapLoginEndpoint();

        // Test endpoint (requires auth)
        users.MapGetProtectedResourceEndpoint();

        // Users CRUD
        users.MapGetUsersEndpoint();
        users.MapGetUserByIdEndpoint();
        users.MapCreateUserEndpoint();
        users.MapUpdateUserEndpoint();
        users.MapDeleteUserEndpoint();

        // Roles
        users.MapGetRolesEndpoint();
        users.MapGetRoleByIdEndpoint();
        users.MapCreateRoleEndpoint();

        // Groups
        users.MapGetGroupsEndpoint();
        users.MapGetGroupByIdEndpoint();
        users.MapCreateGroupEndpoint();

        return endpoints;
    }
}
