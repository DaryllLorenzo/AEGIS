using Aegis.Api.Modules.Users.Features.CreateUser;
using Aegis.Api.Modules.Users.Features.DeleteUser;
using Aegis.Api.Modules.Users.Features.GetProtectedResource;
using Aegis.Api.Modules.Users.Features.GetUserById;
using Aegis.Api.Modules.Users.Features.GetUsers;
using Aegis.Api.Modules.Users.Features.GetUserSelect;
using Aegis.Api.Modules.Users.Features.Login;
using Aegis.Api.Modules.Users.Features.Logout;
using Aegis.Api.Modules.Users.Features.Refresh;
using Aegis.Api.Modules.Users.Features.UpdateUser;
using Aegis.Api.Modules.Users.Features.WhoAmI;
using Aegis.Api.Modules.Users.Services;
using FluentValidation;

namespace Aegis.Api.Modules.Users;

internal static class UsersConfigurations
{
    public const string Tag = "Users";
    public const string UsersPrefixUri = "api/users";

    internal static WebApplicationBuilder AddUsersModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<UserSieveProcessor>();
        builder.Services.AddScoped<JwtTokenService>();
        builder.Services.AddScoped<RefreshTokenService>();

        builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<RefreshValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<LogoutValidator>();

        builder.Services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblyContaining<GetUsersRequest>());

        return builder;
    }

    internal static IEndpointRouteBuilder MapUsersModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var users = endpoints.MapGroup(UsersPrefixUri);

        // Auth (no auth required)
        users.MapLoginEndpoint();
        users.MapRefreshEndpoint();

        // Auth (requires auth)
        users.MapLogoutEndpoint();

        // Test endpoint (requires auth)
        users.MapGetProtectedResourceEndpoint();

        // Current user
        users.MapWhoAmIEndpoint();

        // Users CRUD
        users.MapGetUsersEndpoint();
        users.MapGetUserByIdEndpoint();
        users.MapCreateUserEndpoint();
        users.MapUpdateUserEndpoint();
        users.MapDeleteUserEndpoint();

        // Entity picker (shared select pattern)
        users.MapGetUserSelectEndpoint();

        return endpoints;
    }
}
