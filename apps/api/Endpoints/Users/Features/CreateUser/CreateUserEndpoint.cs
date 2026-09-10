using Aegis.Api.Endpoints.Users.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.CreateUser;

internal static class CreateUserEndpoint
{
    internal const string Name = "CreateUser";

    internal static RouteHandlerBuilder MapCreateUserEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Creates a new user.");

        static async Task<Results<Created<UserDto>, ValidationProblem>> Handle(
            CreateUserRequest request,
            ISender sender,
            IValidator<CreateUserRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);

            return TypedResults.Created(
                $"/api/users/{result.Id}",
                result);
        }
    }
}
