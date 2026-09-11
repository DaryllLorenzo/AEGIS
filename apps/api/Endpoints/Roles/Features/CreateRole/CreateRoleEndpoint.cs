using Aegis.Api.Endpoints.Roles.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Roles.Features.CreateRole;

internal static class CreateRoleEndpoint
{
    internal const string Name = "CreateRole";

    internal static RouteHandlerBuilder MapCreateRoleEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(RolesConfigurations.RolesTag)
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
                $"/api/roles/{result.Id}",
                result);
        }
    }
}
