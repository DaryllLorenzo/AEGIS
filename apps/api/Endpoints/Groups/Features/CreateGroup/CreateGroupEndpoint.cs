using Aegis.Api.Endpoints.Groups.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

internal static class CreateGroupEndpoint
{
    internal const string Name = "CreateGroup";

    internal static RouteHandlerBuilder MapCreateGroupEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPost("/", Handle)
            .WithTags(GroupsConfigurations.GroupsTag)
            .WithName(Name)
            .WithSummary("Creates a new group.")
            .RequireAuthorization();

        static async Task<Results<Created<GroupDto>, ValidationProblem>> Handle(
            CreateGroupRequest request,
            ISender sender,
            IValidator<CreateGroupRequest> validator,
            CancellationToken cancellationToken)
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);

            return TypedResults.Created(
                $"/api/groups/{result.Id}",
                result);
        }
    }
}
