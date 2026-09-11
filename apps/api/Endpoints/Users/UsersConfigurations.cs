using Aegis.Api.Endpoints.Users.Features.CreateUser;
using Aegis.Api.Endpoints.Users.Features.DeleteUser;
using Aegis.Api.Endpoints.Users.Features.GetProtectedResource;
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
        builder.Services.AddScoped<JwtTokenService>();

        builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
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

        return endpoints;
    }
}
