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

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Document type must be Thesis or Article.");

        RuleFor(x => x.FileStream)
            .NotNull().WithMessage("A file is required.");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required.")
            .Must(ct => ct.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Only PDF files are supported.");

        RuleFor(x => x.FileSize)
            .GreaterThan(0).WithMessage("File must not be empty.");
    }
}
