using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.Refresh;

internal static class RefreshEndpoint
{
    internal const string Name = "Refresh";

    internal static RouteHandlerBuilder MapRefreshEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/refresh", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Refreshes an access token using a valid refresh token.");

        static async Task<Results<Ok<RefreshResponse>, UnauthorizedHttpResult, ValidationProblem>> Handle(
            RefreshRequest request,
            ISender sender,
            IValidator<RefreshRequest> validator,
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
            catch (UnauthorizedAccessException)
            {
                return TypedResults.Unauthorized();
            }
        }
    }
}
