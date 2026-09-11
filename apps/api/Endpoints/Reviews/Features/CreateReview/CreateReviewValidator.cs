using FluentValidation;

namespace Aegis.Api.Endpoints.Reviews.Features.CreateReview;

public sealed class CreateReviewValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewValidator()
    {
        RuleFor(x => x.DocumentId)
            .NotEmpty().WithMessage("Document ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Review title is required.")
            .MaximumLength(300).WithMessage("Title must not exceed 300 characters.");

        RuleFor(x => x.Kind)
            .MaximumLength(100).WithMessage("Kind must not exceed 100 characters.");

        RuleFor(x => x.Version)
            .MaximumLength(50).WithMessage("Version must not exceed 50 characters.");

        RuleFor(x => x.Assignee)
            .MaximumLength(200).WithMessage("Assignee must not exceed 200 characters.");
    }
}
