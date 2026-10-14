using Aegis.Common.Result;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Common.Results;

internal static class ResultHttpExtensions
{
    internal static IDictionary<string, string[]> ToFieldErrors(this Error error) =>
        error.FieldErrors.ToDictionary(kv => kv.Key, kv => kv.Value);

    internal static Results<Ok<T>, NotFound> ToOkOrNotFound<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.Type switch
        {
            ErrorType.NotFound => TypedResults.NotFound(),
            _ => throw Unhandled(result.Error),
        };
    }

    internal static Results<Ok<T>, NotFound, ValidationProblem> ToOkNotFoundOrValidation<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        if (result.Error.Type == ErrorType.NotFound)
        {
            return TypedResults.NotFound();
        }

        if (result.Error.Type == ErrorType.Validation)
        {
            return TypedResults.ValidationProblem(result.Error.ToFieldErrors());
        }

        throw Unhandled(result.Error);
    }

    internal static Results<Ok<T>, UnauthorizedHttpResult, ValidationProblem> ToOkOrUnauthorized<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.Type switch
        {
            ErrorType.Unauthorized => TypedResults.Unauthorized(),
            _ => throw Unhandled(result.Error),
        };
    }

    internal static Results<NoContent, NotFound> ToNoContentOrNotFound(this Result result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.NoContent();
        }

        return result.Error.Type switch
        {
            ErrorType.NotFound => TypedResults.NotFound(),
            _ => throw Unhandled(result.Error),
        };
    }

    internal static Results<Created<T>, ValidationProblem> ToCreatedOrValidation<T>(
        this Result<T> result,
        Func<T, string> location)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Created(location(result.Value), result.Value);
        }

        return result.Error.Type switch
        {
            ErrorType.Validation => TypedResults.ValidationProblem(result.Error.ToFieldErrors()),
            _ => throw Unhandled(result.Error),
        };
    }

    internal static Results<Created<T>, NotFound, ValidationProblem> ToCreatedNotFoundOrValidation<T>(
        this Result<T> result,
        Func<T, string> location)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Created(location(result.Value), result.Value);
        }

        if (result.Error.Type == ErrorType.NotFound)
        {
            return TypedResults.NotFound();
        }

        if (result.Error.Type == ErrorType.Validation)
        {
            return TypedResults.ValidationProblem(result.Error.ToFieldErrors());
        }

        throw Unhandled(result.Error);
    }

    internal static Results<Ok<T>, ValidationProblem, ProblemHttpResult> ToOkValidationOrForbidden<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        if (result.Error.Type == ErrorType.Validation)
        {
            return TypedResults.ValidationProblem(result.Error.ToFieldErrors());
        }

        if (result.Error.Type == ErrorType.Forbidden)
        {
            return TypedResults.Problem(statusCode: 403, detail: result.Error.Message);
        }

        throw Unhandled(result.Error);
    }

    internal static Results<Ok<T>, NotFound, ValidationProblem, ProblemHttpResult>
        ToOkNotFoundValidationOrForbidden<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        if (result.Error.Type == ErrorType.NotFound)
        {
            return TypedResults.NotFound();
        }

        if (result.Error.Type == ErrorType.Validation)
        {
            return TypedResults.ValidationProblem(result.Error.ToFieldErrors());
        }

        if (result.Error.Type == ErrorType.Forbidden)
        {
            return TypedResults.Problem(statusCode: 403, detail: result.Error.Message);
        }

        throw Unhandled(result.Error);
    }

    // Failure surface is NotFound only, but the success body needs extra
    // work (e.g. streaming a file), so this maps just the failure branch.
    internal static NotFound ToNotFound<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            throw new InvalidOperationException("Cannot map a successful result to NotFound.");
        }

        if (result.Error.Type != ErrorType.NotFound)
        {
            throw Unhandled(result.Error);
        }

        return TypedResults.NotFound();
    }

    private static InvalidOperationException Unhandled(Error error) =>
        new($"Unhandled error type '{error.Type}' for code '{error.Code}'.");
}
