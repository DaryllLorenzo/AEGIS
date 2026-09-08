using FluentValidation;

namespace Aegis.Api.Endpoints.Faculties.Features.UpdateFaculty;

public sealed class UpdateFacultyValidator : AbstractValidator<UpdateFacultyRequest>
{
    public UpdateFacultyValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Faculty name is required.")
            .MaximumLength(200).WithMessage("Faculty name must not exceed 200 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Faculty code must not exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
    }
}
