using FluentValidation;

namespace Aegis.Api.Endpoints.Reviews.Features.UpdateReview;

public sealed class UpdateReviewValidator : AbstractValidator<UpdateReviewRequest>
{
    public UpdateReviewValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Review title is required.")
            .MaximumLength(300).WithMessage("Title must not exceed 300 characters.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .MaximumLength(50).WithMessage("Status must not exceed 50 characters.");

        RuleFor(x => x.Kind)
            .MaximumLength(100).WithMessage("Kind must not exceed 100 characters.");

        RuleFor(x => x.Version)
            .MaximumLength(50).WithMessage("Version must not exceed 50 characters.");

        RuleFor(x => x.Assignee)
            .MaximumLength(200).WithMessage("Assignee must not exceed 200 characters.");
    }
}
