using Aegis.Api.Common.Authz;
using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Roles.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Roles.Features.CreateRole;

internal static class CreateRoleEndpoint
{
    internal const string Name = "CreateRole";

    internal static RouteHandlerBuilder MapCreateRoleEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(RolesConfigurations.RolesTag)
            .WithName(Name)
            .WithSummary("Creates a new role.")
            .RequireAuthorization()
            .RequireAdmin();

        static async Task<Results<Created<RoleDto>, ValidationProblem, ProblemHttpResult>> Handle(
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

            return result.ToCreatedOrValidationOrConflict(r => $"/api/roles/{r.Id}");
        }
    }
}
