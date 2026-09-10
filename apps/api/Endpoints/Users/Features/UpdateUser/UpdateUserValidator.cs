using FluentValidation;

namespace Aegis.Api.Endpoints.Users.Features.UpdateUser;

public sealed class UpdateUserValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email address.")
            .MaximumLength(300).WithMessage("Email must not exceed 300 characters.");

        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Display name is required.")
            .MaximumLength(200).WithMessage("Display name must not exceed 200 characters.");
    }
}
