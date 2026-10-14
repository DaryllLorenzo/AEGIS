namespace Aegis.Common.Result;

// "Error" is a VB.NET keyword (CA1716); this package is C#-only, so the
// name is kept and the rule suppressed at the declaration.
#pragma warning disable CA1716
public sealed record Error(ErrorType Type, string Code, string Message)
{
    public IReadOnlyDictionary<string, string[]> FieldErrors { get; init; } =
        new Dictionary<string, string[]>();

    public static readonly Error None = new(ErrorType.Failure, string.Empty, string.Empty);

    public static Error NotFound(string code, string message) =>
        new(ErrorType.NotFound, code, message);

    public static Error Validation(string field, string message) =>
        new(ErrorType.Validation, field, message)
        {
            FieldErrors = new Dictionary<string, string[]> { [field] = [message] },
        };

    public static Error Validation(IReadOnlyDictionary<string, string[]> fieldErrors, string message) =>
        new(ErrorType.Validation, "Validation", message) { FieldErrors = fieldErrors };

    public static Error Unauthorized(string code, string message) =>
        new(ErrorType.Unauthorized, code, message);

    public static Error Forbidden(string code, string message) =>
        new(ErrorType.Forbidden, code, message);

    public static Error Conflict(string code, string message) =>
        new(ErrorType.Conflict, code, message);

    public static Error Failure(string code, string message) =>
        new(ErrorType.Failure, code, message);
}

#pragma warning restore CA1716
