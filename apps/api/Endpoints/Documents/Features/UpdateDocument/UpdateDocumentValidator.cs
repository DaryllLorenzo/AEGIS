using FluentValidation;

namespace Aegis.Api.Endpoints.Documents.Features.UpdateDocument;

public sealed class UpdateDocumentValidator : AbstractValidator<UpdateDocumentRequest>
{
    public UpdateDocumentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Document name is required.")
            .MaximumLength(300).WithMessage("Name must not exceed 300 characters.");

        When(x => x.FileStream is not null, () =>
        {
            RuleFor(x => x.FileName)
                .NotEmpty().WithMessage("File name is required when a file is provided.");

            RuleFor(x => x.ContentType)
                .NotEmpty().WithMessage("Content type is required when a file is provided.");

            RuleFor(x => x.FileSize)
                .NotNull().WithMessage("File must not be empty.")
                .GreaterThan(0).WithMessage("File must not be empty.");
        });
    }
}
