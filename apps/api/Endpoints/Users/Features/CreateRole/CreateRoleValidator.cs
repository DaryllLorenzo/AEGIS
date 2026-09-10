using FluentValidation;

namespace Aegis.Api.Endpoints.Users.Features.CreateRole;

public sealed class CreateRoleValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(100).WithMessage("Role name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
