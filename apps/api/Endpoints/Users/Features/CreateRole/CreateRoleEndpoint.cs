using Aegis.Api.Endpoints.Users.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Users.Features.CreateRole;

internal static class CreateRoleEndpoint
{
    internal const string Name = "CreateRole";

    internal static RouteHandlerBuilder MapCreateRoleEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(UsersConfigurations.RolesTag)
            .WithName(Name)
            .WithSummary("Creates a new role.");

        static async Task<Results<Created<RoleDto>, ValidationProblem>> Handle(
            CreateRoleRequest request,
            ISender sender,
            IValidator<CreateRoleRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);

            return TypedResults.Created(
                $"/api/users/roles/{result.Id}",
                result);
        }
    }
}
