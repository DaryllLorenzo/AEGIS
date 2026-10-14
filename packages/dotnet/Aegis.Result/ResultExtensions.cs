namespace Aegis.Common.Result;

public static class ResultExtensions
{
    public static Result<TResult> Map<T, TResult>(this Result<T> result, Func<T, TResult> mapper)
    {
        return result.IsSuccess
            ? Result<TResult>.Success(mapper(result.Value))
            : Result<TResult>.Failure(result.Error);
    }

    public static Result<TResult> Bind<T, TResult>(this Result<T> result, Func<T, Result<TResult>> next)
    {
        return result.IsSuccess
            ? next(result.Value)
            : Result<TResult>.Failure(result.Error);
    }

    public static TResult Match<T, TResult>(
        this Result<T> result,
        Func<T, TResult> onSuccess,
        Func<Error, TResult> onFailure)
    {
        return result.IsSuccess ? onSuccess(result.Value) : onFailure(result.Error);
    }

    public static Result Tap<T>(this Result<T> result, Action<T> onSuccess)
    {
        if (result.IsSuccess)
        {
            onSuccess(result.Value);
        }

        return result.IsSuccess ? Result.Success() : Result.Failure(result.Error);
    }

    public static Result<T> Ensure<T>(this Result<T> result, Func<T, bool> predicate, Error error)
    {
        return result.IsSuccess && !predicate(result.Value) ? Result<T>.Failure(error) : result;
    }
}
