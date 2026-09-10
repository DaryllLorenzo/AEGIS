using Aegis.Api.Endpoints.Users.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.Login;

internal static class LoginEndpoint
{
    internal const string Name = "Login";

    internal static RouteHandlerBuilder MapLoginEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/login", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Authenticates a user and returns a JWT token.");

        static async Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult, ValidationProblem>> Handle(
            LoginRequest request,
            ISender sender,
            IValidator<LoginRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            try
            {
                var result = await sender.Send(request, cancellationToken);
                return TypedResults.Ok(result);
            }
            catch (InvalidCredentialsException)
            {
                return TypedResults.Unauthorized();
            }
        }
    }
}
