using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.Logout;

internal static class LogoutEndpoint
{
    internal const string Name = "Logout";

    internal static RouteHandlerBuilder MapLogoutEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/logout", Handle)
            .RequireAuthorization()
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Revokes the refresh token, effectively logging the user out.");

        static async Task<Results<Ok<LogoutResponse>, UnauthorizedHttpResult, ValidationProblem>> Handle(
            LogoutRequest request,
            ISender sender,
            IValidator<LogoutRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);
            return TypedResults.Ok(result);
        }
    }
}
