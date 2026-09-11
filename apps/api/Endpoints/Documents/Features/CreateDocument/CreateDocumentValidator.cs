using FluentValidation;

namespace Aegis.Api.Endpoints.Documents.Features.CreateDocument;

public sealed class CreateDocumentValidator : AbstractValidator<CreateDocumentRequest>
{
    public CreateDocumentValidator()
    {
        RuleFor(x => x.GroupId)
            .NotEmpty().WithMessage("Group ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Document name is required.")
            .MaximumLength(300).WithMessage("Name must not exceed 300 characters.");

        RuleFor(x => x.FileStream)
            .NotNull().WithMessage("A file is required.");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required.");

        RuleFor(x => x.FileSize)
            .GreaterThan(0).WithMessage("File must not be empty.");
    }
}
