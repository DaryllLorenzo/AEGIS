using Aegis.Api.Endpoints.Groups.Data;
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

        RuleForEach(x => x.Members!)
            .ChildRules(member =>
            {
                member.RuleFor(m => m.UserId)
                    .NotEmpty().WithMessage("Member user ID is required.");
                member.RuleFor(m => m.Roles)
                    .NotEmpty().WithMessage("Each member needs at least one role.");
                member.RuleForEach(m => m.Roles)
                    .Must(r => GroupRoles.Assignable.Contains(r))
                    .WithMessage("Member roles must be Submitter or Reviewer.");
            });
    }
}
