using FluentValidation;

namespace Aegis.Api.Endpoints.Annotations.Features.BulkUpdateAnnotations;

public sealed class BulkUpdateAnnotationsValidator : AbstractValidator<BulkUpdateAnnotationsRequest>
{
    public BulkUpdateAnnotationsValidator()
    {
        RuleFor(x => x.DocumentId)
            .NotEmpty().WithMessage("Document ID is required.");

        RuleForEach(x => x.Annotations).ChildRules(item =>
        {
            item.RuleFor(a => a.PageNumber)
                .GreaterThan(0).WithMessage("Page number must be greater than 0.");

            item.RuleFor(a => a.Type)
                .NotEmpty().WithMessage("Annotation type is required.")
                .MaximumLength(50).WithMessage("Type must not exceed 50 characters.");

            item.RuleFor(a => a.Geometry)
                .NotEmpty().WithMessage("Geometry is required.");

            item.RuleFor(a => a.Content)
                .MaximumLength(2000).WithMessage("Content must not exceed 2000 characters.");

            item.RuleFor(a => a.Color)
                .MaximumLength(20).WithMessage("Color must not exceed 20 characters.");
        });
    }
}
