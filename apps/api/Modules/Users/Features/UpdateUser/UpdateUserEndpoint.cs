using Aegis.Api.Common.Authz;
using Aegis.Api.Common.Results;
using Aegis.Api.Modules.Users.Dtos;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Modules.Users.Features.UpdateUser;

internal static class UpdateUserEndpoint
{
    internal const string Name = "UpdateUser";

    internal static RouteHandlerBuilder MapUpdateUserEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints
            .MapPut("/{id:guid}", Handle)
            .WithTags(UsersConfigurations.Tag)
            .WithName(Name)
            .WithSummary("Updates an existing user.")
            .RequireAuthorization()
            .RequireAdmin();

        static async Task<Results<Ok<UserDto>, NotFound, ValidationProblem>> Handle(
            Guid id,
            UpdateUserBody body,
            ISender sender,
            IValidator<UpdateUserRequest> validator,
            CancellationToken cancellationToken)
        {
            var request = new UpdateUserRequest(id, body.Email, body.DisplayName);

            var validation = await validator.ValidateAsync(request, cancellationToken);

            if (!validation.IsValid)
            {
                return TypedResults.ValidationProblem(validation.ToDictionary());
            }

            var result = await sender.Send(request, cancellationToken);
            return result.ToOkNotFoundOrValidation();
        }
    }
}

internal sealed record UpdateUserBody
{
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
}
