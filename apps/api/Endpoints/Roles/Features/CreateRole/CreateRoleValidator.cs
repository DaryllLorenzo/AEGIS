using FluentValidation;

namespace Aegis.Api.Endpoints.Roles.Features.CreateRole;

public sealed class CreateRoleValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
