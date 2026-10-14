namespace Aegis.Common.Result;

public readonly struct Result
{
    private readonly Error? _error;
    private readonly bool _isSuccess;

    private Result(bool isSuccess, Error? error)
    {
        _isSuccess = isSuccess;
        _error = error;
    }

    public bool IsSuccess => _isSuccess;
    public bool IsFailure => !_isSuccess;

    public Error Error => _error ?? Aegis.Common.Result.Error.None;

    public static Result Success() => new(true, null);

    public static Result Failure(Error error) => new(
        false,
        error ?? throw new ArgumentNullException(nameof(error)));

    public static implicit operator Result(Error error) => Failure(error);
}
