using Aegis.Api.Common.Results;
using Aegis.Common.Result;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aegis.Api.Tests.Common.Results;

public sealed class ResultHttpExtensionsTests
{
    [Fact]
    public void ToOkOrNotFound_MapsBothBranches()
    {
        Result<string> found = "value";
        Result<string> missing = Error.NotFound("Doc.NotFound", "missing");
        Result<string> failure = Error.Failure("Doc.Failed", "boom");

        Assert.Equal(200, StatusCodeOf(found.ToOkOrNotFound()));
        Assert.IsType<NotFound>(InnerOf(missing.ToOkOrNotFound()));
        Assert.Throws<InvalidOperationException>(() => _ = failure.ToOkOrNotFound());
    }

    [Fact]
    public void ToOkNotFoundOrValidation_MapsValidationErrorWithFields()
    {
        Result<string> found = "value";
        Result<string> missing = Error.NotFound("Doc.NotFound", "missing");
        Result<string> invalid = Error.Validation("title", "Title is required.");

        Assert.Equal(200, StatusCodeOf(found.ToOkNotFoundOrValidation()));
        Assert.IsType<NotFound>(InnerOf(missing.ToOkNotFoundOrValidation()));

        var validation = (ValidationProblem)InnerOf(invalid.ToOkNotFoundOrValidation());
        Assert.Equal(400, validation.StatusCode);
        Assert.Contains("title", validation.ProblemDetails.Errors.Keys);
    }

    [Fact]
    public void ToOkOrUnauthorized_MapsUnauthorized()
    {
        Result<string> found = "value";
        Result<string> anonymous = Error.Unauthorized("Auth.InvalidCredentials", "bad");

        Assert.Equal(200, StatusCodeOf(found.ToOkOrUnauthorized()));
        Assert.IsType<UnauthorizedHttpResult>(InnerOf(anonymous.ToOkOrUnauthorized()));
    }

    [Fact]
    public void ToNoContentOrNotFound_MapsBothBranches()
    {
        Result found = Result.Success();
        Result missing = Error.NotFound("Doc.NotFound", "missing");

        Assert.Equal(204, StatusCodeOf(found.ToNoContentOrNotFound()));
        Assert.IsType<NotFound>(InnerOf(missing.ToNoContentOrNotFound()));
    }

    [Fact]
    public void ToCreatedOrValidation_MapsAllBranches()
    {
        Result<string> created = "value";
        Result<string> invalid = Error.Validation("name", "Name is required.");
        Result<string> anonymous = Error.Unauthorized("Auth.NoUser", "no user");

        Assert.Equal(201, StatusCodeOf(created.ToCreatedOrValidation(_ => "/api/docs/1")));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToCreatedOrValidation(_ => "/api/docs/1")));
        Assert.IsType<UnauthorizedHttpResult>(InnerOf(anonymous.ToCreatedOrValidation(_ => "/api/docs/1")));
    }

    [Fact]
    public void ToCreatedNotFoundOrValidation_MapsAllBranches()
    {
        Result<string> created = "value";
        Result<string> missing = Error.NotFound("Doc.NotFound", "missing");
        Result<string> invalid = Error.Validation("name", "Name is required.");
        Result<string> anonymous = Error.Unauthorized("Auth.NoUser", "no user");

        Assert.Equal(201, StatusCodeOf(created.ToCreatedNotFoundOrValidation(_ => "/api/docs/1")));
        Assert.IsType<NotFound>(InnerOf(missing.ToCreatedNotFoundOrValidation(_ => "/api/docs/1")));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToCreatedNotFoundOrValidation(_ => "/api/docs/1")));
        Assert.IsType<UnauthorizedHttpResult>(InnerOf(anonymous.ToCreatedNotFoundOrValidation(_ => "/api/docs/1")));
    }

    [Fact]
    public void ToCreatedOrValidationOrConflict_MapsAllBranches()
    {
        Result<string> created = "value";
        Result<string> invalid = Error.Validation("name", "Name is required.");
        Result<string> conflict = Error.Conflict("User.EmailExists", "taken");

        Assert.Equal(201, StatusCodeOf(created.ToCreatedOrValidationOrConflict(_ => "/api/users/1")));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToCreatedOrValidationOrConflict(_ => "/api/users/1")));
        Assert.Equal(409, StatusCodeOf(conflict.ToCreatedOrValidationOrConflict(_ => "/api/users/1")));
    }

    [Fact]
    public void ToOkNotFoundValidationOrConflict_MapsAllBranches()
    {
        Result<string> found = "value";
        Result<string> missing = Error.NotFound("User.NotFound", "missing");
        Result<string> invalid = Error.Validation("email", "Email is required.");
        Result<string> conflict = Error.Conflict("User.EmailExists", "taken");

        Assert.Equal(200, StatusCodeOf(found.ToOkNotFoundValidationOrConflict()));
        Assert.IsType<NotFound>(InnerOf(missing.ToOkNotFoundValidationOrConflict()));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToOkNotFoundValidationOrConflict()));
        Assert.Equal(409, StatusCodeOf(conflict.ToOkNotFoundValidationOrConflict()));
    }

    [Fact]
    public void ToOkValidationOrForbidden_MapsAllBranches()
    {
        Result<string> found = "value";
        Result<string> invalid = Error.Validation("name", "Name is required.");
        Result<string> denied = Error.Forbidden("Doc.Permission", "nope");

        Assert.Equal(200, StatusCodeOf(found.ToOkValidationOrForbidden()));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToOkValidationOrForbidden()));
        Assert.Equal(403, StatusCodeOf(denied.ToOkValidationOrForbidden()));
    }

    [Fact]
    public void ToOkNotFoundValidationOrForbidden_MapsAllBranches()
    {
        Result<string> found = "value";
        Result<string> missing = Error.NotFound("Doc.NotFound", "missing");
        Result<string> invalid = Error.Validation("name", "Name is required.");
        Result<string> denied = Error.Forbidden("Doc.Permission", "nope");

        Assert.Equal(200, StatusCodeOf(found.ToOkNotFoundValidationOrForbidden()));
        Assert.IsType<NotFound>(InnerOf(missing.ToOkNotFoundValidationOrForbidden()));
        Assert.IsType<ValidationProblem>(InnerOf(invalid.ToOkNotFoundValidationOrForbidden()));
        Assert.Equal(403, StatusCodeOf(denied.ToOkNotFoundValidationOrForbidden()));
    }

    [Fact]
    public void ToNotFound_ThrowsOnSuccessAndUnhandledError()
    {
        Result<string> missing = Error.NotFound("Doc.NotFound", "missing");
        Result<string> found = "value";
        Result<string> failure = Error.Failure("Doc.Failed", "boom");

        Assert.IsType<NotFound>(missing.ToNotFound());
        Assert.Throws<InvalidOperationException>(() => _ = found.ToNotFound());
        Assert.Throws<InvalidOperationException>(() => _ = failure.ToNotFound());
    }

    private static IResult InnerOf(IResult result) =>
        ((INestedHttpResult)result).Result;

    private static int StatusCodeOf(IResult result) =>
        ((IStatusCodeHttpResult)InnerOf(result)).StatusCode!.Value;
}
