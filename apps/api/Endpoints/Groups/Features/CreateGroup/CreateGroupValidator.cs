using FluentValidation;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

public sealed class CreateGroupValidator : AbstractValidator<CreateGroupRequest>
{
    public CreateGroupValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Group name is required.")
            .MaximumLength(200).WithMessage("Group name must not exceed 200 characters.");

        RuleFor(x => x.FacultyId)
            .NotEmpty().WithMessage("Faculty ID is required.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
    }
}
